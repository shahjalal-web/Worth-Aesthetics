/**
 * Seeds store structure the storefront expects: collections, the Journal blog,
 * FAQ / ingredient / announcement metaobjects — and publishes collections to
 * the Headless channel. Idempotent: anything that exists is skipped (never
 * overwritten, never deleted). Logs every change.
 *
 *   npx tsx --env-file=.env scripts/seed-content.mts --dry-run
 *   npx tsx --env-file=.env scripts/seed-content.mts
 */
import { fallbackFaq, fallbackIngredients } from "../content/site-copy.ts";
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";

type Rule = { column: "TYPE" | "TAG" | "TITLE" | "VARIANT_PRICE" | "IS_PRICE_REDUCED"; relation: "EQUALS" | "CONTAINS" | "GREATER_THAN" | "IS_SET"; condition: string };
type CollectionSeed = { handle: string; title: string; description: string; rules?: Rule[]; disjunctive?: boolean };

/**
 * Smart collections driven by product type & tags, so the client only has to
 * set a product's type/tags and it lands in the right place.
 */
const COLLECTIONS: CollectionSeed[] = [
  { handle: "shop-all", title: "Shop All", description: "The complete Worth Aesthetics collection.", rules: [{ column: "VARIANT_PRICE", relation: "GREATER_THAN", condition: "0" }] },
  { handle: "serums", title: "Serums", description: "Concentrated peptide serums.", rules: [{ column: "TYPE", relation: "EQUALS", condition: "Serum" }] },
  { handle: "creams-moisturizers", title: "Creams & Moisturizers", description: "Rich treatment creams that seal in your ritual.", rules: [{ column: "TYPE", relation: "EQUALS", condition: "Cream" }] },
  { handle: "sets", title: "Sets & Rituals", description: "Curated routines, beautifully paired.", rules: [{ column: "TYPE", relation: "EQUALS", condition: "Set" }] },
  { handle: "accessories", title: "Accessories", description: "Considered companions for your ritual.", rules: [{ column: "TYPE", relation: "EQUALS", condition: "Accessory" }] },
  { handle: "bestsellers", title: "Bestsellers", description: "The formulas our clients return to.", rules: [{ column: "TAG", relation: "EQUALS", condition: "bestseller" }] },
  { handle: "new", title: "New Arrivals", description: "The latest from the Worth Aesthetics laboratory.", rules: [{ column: "TAG", relation: "EQUALS", condition: "new" }] },
  { handle: "anti-wrinkle", title: "Fine Lines & Wrinkles", description: "Formulas that help soften the look of fine lines.", rules: [{ column: "TAG", relation: "EQUALS", condition: "concern:wrinkles" }] },
  { handle: "firming", title: "Firmness", description: "For skin that looks firmer and more resilient.", rules: [{ column: "TAG", relation: "EQUALS", condition: "concern:firmness" }] },
  { handle: "texture", title: "Texture", description: "For a smoother, more refined-looking surface.", rules: [{ column: "TAG", relation: "EQUALS", condition: "concern:texture" }] },
  { handle: "radiance", title: "Dullness & Radiance", description: "For a luminous, revitalised-looking complexion.", rules: [{ column: "TAG", relation: "EQUALS", condition: "concern:dullness" }] },
  { handle: "hydration", title: "Hydration", description: "For skin that feels supple and deeply hydrated.", rules: [{ column: "TAG", relation: "EQUALS", condition: "concern:hydration" }] },
];

const ANNOUNCEMENTS = [
  `Complimentary US shipping on orders over $${process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 75}`,
  "Secure checkout with Shop Pay, Apple Pay & Google Pay",
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

async function headlessPublicationId(): Promise<string | undefined> {
  const data = await admin<{ publications: { nodes: { id: string; name: string }[] } }>(
    `query { publications(first: 25) { nodes { id name } } }`,
  );
  return data.publications.nodes.find((p) => /headless/i.test(p.name))?.id;
}

async function publish(id: string, publicationId: string | undefined, label: string) {
  if (!publicationId || DRY_RUN) return;
  const res = await admin(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`,
    { id, input: [{ publicationId }] },
  );
  check(res.publishablePublish, `publish ${label}`);
}

async function seedCollections(publicationId: string | undefined) {
  for (const c of COLLECTIONS) {
    const found = await admin<{ collections: { nodes: { id: string; handle: string }[] } }>(
      `query($q: String!) { collections(first: 1, query: $q) { nodes { id handle } } }`,
      { q: `handle:${c.handle}` },
    );
    const existing = found.collections.nodes.find((n) => n.handle === c.handle);
    if (existing) {
      log.skip(`collection /${c.handle}`);
      await publish(existing.id, publicationId, c.handle); // make sure it's visible to the storefront
      continue;
    }
    log.create(`collection /${c.handle} (${c.rules ? "smart" : "manual"})`);
    if (DRY_RUN) continue;
    const res = await admin(
      `mutation($input: CollectionInput!) {
        collectionCreate(input: $input) { collection { id } userErrors { field message } }
      }`,
      {
        input: {
          title: c.title,
          handle: c.handle,
          descriptionHtml: `<p>${c.description}</p>`,
          ...(c.rules ? { ruleSet: { appliedDisjunctively: c.disjunctive ?? false, rules: c.rules } } : {}),
        },
      },
    );
    check(res.collectionCreate, `collection ${c.handle}`);
    await publish(res.collectionCreate.collection.id, publicationId, c.handle);
  }
}

async function seedBlog() {
  const found = await admin<{ blogs: { nodes: { handle: string }[] } }>(`query { blogs(first: 25) { nodes { handle } } }`);
  if (found.blogs.nodes.some((b) => b.handle === "journal")) return log.skip("blog /blogs/journal");
  log.create("blog /blogs/journal");
  if (DRY_RUN) return;
  const res = await admin(
    `mutation($blog: BlogCreateInput!) { blogCreate(blog: $blog) { blog { id } userErrors { field message } } }`,
    { blog: { title: "Journal", handle: "journal" } },
  );
  check(res.blogCreate, "blog journal");
}

async function seedMetaobjects(type: string, entries: { handle: string; fields: Record<string, string | null | undefined> }[]) {
  for (const e of entries) {
    const found = await admin<{ metaobjectByHandle: { id: string } | null }>(
      `query($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { id } }`,
      { h: { type, handle: e.handle } },
    );
    if (found.metaobjectByHandle) {
      log.skip(`${type} "${e.handle}"`);
      continue;
    }
    log.create(`${type} "${e.handle}"`);
    if (DRY_RUN) continue;
    const res = await admin(
      `mutation($m: MetaobjectCreateInput!) { metaobjectCreate(metaobject: $m) { metaobject { id } userErrors { field message } } }`,
      {
        m: {
          type,
          handle: e.handle,
          fields: Object.entries(e.fields)
            .filter(([, v]) => v != null && v !== "")
            .map(([key, value]) => ({ key, value: String(value) })),
        },
      },
    );
    check(res.metaobjectCreate, `${type} ${e.handle}`);
  }
}

console.log(`\nWorth Aesthetics — content seed ${DRY_RUN ? "(DRY RUN — no changes)" : ""}\n`);
try {
  const publicationId = await headlessPublicationId();
  log.info(publicationId ? `Headless publication: ${publicationId}` : "No Headless publication found — collections won't be auto-published");
  await seedCollections(publicationId);
  await seedBlog();
  await seedMetaobjects(
    "faq_item",
    fallbackFaq.map((f) => ({ handle: slug(f.question), fields: { question: f.question, answer: f.answer, category: f.category } })),
  );
  await seedMetaobjects(
    "ingredient",
    fallbackIngredients.map((i) => ({ handle: slug(i.name), fields: { name: i.name, inci: i.inci, short_description: i.description } })),
  );
  await seedMetaobjects("announcement", ANNOUNCEMENTS.map((text) => ({ handle: slug(text), fields: { text } })));
  console.log("\nDone.");
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
