/**
 * Seeds the known Worth Aesthetics products (CLAUDE.md §4) with images,
 * `worth.*` metafields, tags (drive smart collections) and PLACEHOLDER prices.
 * Idempotent by handle — existing products are skipped, never overwritten or deleted.
 *
 *   npx tsx --env-file=.env scripts/seed-products.mts --dry-run
 *   npx tsx --env-file=.env scripts/seed-products.mts            # creates as DRAFT
 *   npx tsx --env-file=.env scripts/seed-products.mts --active   # creates as ACTIVE + publishes to Headless
 *
 * ⚠️ Prices, copy and claims are placeholders (TBC with client). Tag `tbc` is added so they're easy to find.
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";

const ACTIVE = process.argv.includes("--active");

type Seed = {
  handle: string;
  title: string;
  productType: "Serum" | "Cream" | "Accessory" | "Set";
  tags: string[];
  price: string;
  compareAt?: string;
  image: string; // file in public/placeholder
  imageAlt: string;
  descriptionHtml: string;
  meta: Record<string, string | string[] | undefined>;
  ingredients?: string[]; // ingredient metaobject handles
};

const howTo = (text: string) =>
  JSON.stringify({ type: "root", children: [{ type: "paragraph", children: [{ type: "text", value: text }] }] });

const PRODUCTS: Seed[] = [
  {
    handle: "snap-8-ghk-cu-face-serum",
    title: "Snap-8 + GHK-Cu Face Serum",
    productType: "Serum",
    tags: ["bestseller", "concern:wrinkles", "concern:firmness", "tbc"],
    price: "68.00",
    image: "snap8-serum.jpg",
    imageAlt: "Worth Aesthetics Snap-8 + GHK-Cu Face Serum dropper bottle",
    descriptionHtml:
      "<p>A concentrated multi-peptide serum pairing Snap-8 with copper tripeptide. Lightweight and fast-absorbing, it helps soften the look of expression lines and supports firmer, smoother-looking skin.</p>",
    meta: {
      subtitle: "Line-smoothing peptide serum",
      active_complex: "Acetyl Octapeptide-3 + Copper Tripeptide-1",
      size_label: "30 ML / 1.0 FL. OZ.",
      badge: "Bestseller",
      routine_step: "2",
      benefits: ["Helps soften the look of expression lines", "Supports firmer-looking skin", "Lightweight, fast-absorbing texture"],
      skin_concerns: ["Wrinkles", "Firmness"],
      skin_types: ["All skin types"],
      how_to_use: howTo("Morning and evening, apply 3–5 drops to cleansed face and neck. Gently press until absorbed, then follow with moisturizer. Use SPF in the morning."),
    },
    ingredients: ["snap-8", "ghk-cu", "hyaluronic-acid"],
  },
  {
    handle: "nad-pdrn-serum",
    title: "NAD+ PDRN Serum",
    productType: "Serum",
    tags: ["new", "bestseller", "concern:dullness", "concern:texture", "tbc"],
    price: "88.00",
    image: "nad-pdrn-serum.jpg",
    imageAlt: "Worth Aesthetics NAD+ PDRN Serum airless bottle and carton on marble",
    descriptionHtml:
      "<p>An airless-pump serum uniting NAD+ with PDRN for a revitalised, bouncier-looking complexion. Silky and quick to absorb, it layers beautifully beneath your cream.</p>",
    meta: {
      subtitle: "Revitalising renewal serum",
      active_complex: "NAD+ · PDRN Complex",
      size_label: "50 ML / 1.75 FL. OZ.",
      badge: "New",
      routine_step: "2",
      benefits: ["Helps skin look revitalised and luminous", "Smoother, bouncier-looking complexion", "Airless pump protects the formula"],
      skin_concerns: ["Dullness", "Texture"],
      skin_types: ["All skin types"],
      how_to_use: howTo("Morning and evening, dispense one to two pumps and press into cleansed face and neck. Follow with moisturizer."),
    },
    ingredients: ["nad", "pdrn", "niacinamide"],
  },
  {
    handle: "ghk-cu-snap-8-firming-cream",
    title: "GHK-Cu Snap-8 Firming Cream",
    productType: "Cream",
    tags: ["bestseller", "concern:firmness", "concern:wrinkles", "concern:hydration", "tbc"],
    price: "78.00",
    image: "firming-cream.jpg",
    imageAlt: "Worth Aesthetics GHK-Cu Snap-8 Firming Cream jars",
    descriptionHtml:
      "<p>A cushioning treatment cream with copper tripeptide, Snap-8 and hyaluronic acid. It melts into skin, leaving it feeling deeply hydrated and looking firmer and smoother.</p>",
    meta: {
      subtitle: "Firming peptide treatment cream",
      active_complex: "Copper Tripeptide-1 + Snap-8 + Hyaluronic Acid",
      size_label: "50 G / 1.7 OZ.",
      badge: "Bestseller",
      routine_step: "3",
      benefits: ["Helps skin look firmer and smoother", "Deep, lasting hydration", "Rich yet non-greasy finish"],
      skin_concerns: ["Firmness", "Wrinkles", "Hydration"],
      skin_types: ["Dry", "Normal", "Combination"],
      how_to_use: howTo("Morning and evening, use the spatula to take a pearl-sized amount. Warm between fingertips and smooth over face and neck as the final step of your routine."),
    },
    ingredients: ["ghk-cu", "snap-8", "hyaluronic-acid"],
  },
  {
    handle: "worth-leather-pouch",
    title: "The Signature Pouch",
    productType: "Accessory",
    tags: ["tbc"],
    price: "35.00",
    image: "leather-pouch.jpg",
    imageAlt: "Worth Aesthetics tan leather pouch embossed with the WA monogram",
    descriptionHtml: "<p>A soft, supple pouch embossed with the WA monogram — made to carry your ritual from home to hotel suite.</p>",
    meta: {
      subtitle: "Soft leather travel pouch",
      active_complex: "Embossed WA Monogram",
      size_label: "Accessory",
    },
  },
];

const TYPES: Record<string, string> = {
  subtitle: "single_line_text_field",
  active_complex: "single_line_text_field",
  size_label: "single_line_text_field",
  badge: "single_line_text_field",
  routine_step: "single_line_text_field",
  benefits: "list.single_line_text_field",
  skin_concerns: "list.single_line_text_field",
  skin_types: "list.single_line_text_field",
  how_to_use: "rich_text_field",
  key_ingredients: "list.metaobject_reference",
};

async function uploadImage(file: string): Promise<string> {
  const full = path.join(process.cwd(), "public", "placeholder", file);
  const [bytes, info] = await Promise.all([readFile(full), stat(full)]);
  const staged = await admin(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    { input: [{ filename: file, mimeType: "image/jpeg", resource: "IMAGE", httpMethod: "POST", fileSize: String(info.size) }] },
  );
  check(staged.stagedUploadsCreate, `stage ${file}`);
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), file);
  const res = await fetch(target.url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`upload ${file} failed: ${res.status}`);
  return target.resourceUrl;
}

async function ingredientIds(handles: string[] = []) {
  const ids: string[] = [];
  for (const handle of handles) {
    const r = await admin<{ metaobjectByHandle: { id: string } | null }>(
      `query($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { id } }`,
      { h: { type: "ingredient", handle } },
    );
    if (r.metaobjectByHandle) ids.push(r.metaobjectByHandle.id);
  }
  return ids;
}

console.log(`\nWorth Aesthetics — product seed ${DRY_RUN ? "(DRY RUN — no changes)" : ACTIVE ? "(ACTIVE)" : "(DRAFT)"}\n`);
try {
  const pubs = await admin<{ publications: { nodes: { id: string; name: string }[] } }>(`query { publications(first: 25) { nodes { id name } } }`);
  const headless = pubs.publications.nodes.find((p) => /headless/i.test(p.name))?.id;

  for (const p of PRODUCTS) {
    const found = await admin<{ productByIdentifier: { id: string } | null }>(
      `query($h: String!) { productByIdentifier(identifier: { handle: $h }) { id } }`,
      { h: p.handle },
    );
    if (found.productByIdentifier) {
      log.skip(`product /${p.handle}`);
      continue;
    }
    log.create(`product /${p.handle} — $${p.price} (placeholder), ${p.productType}, tags: ${p.tags.join(", ")}`);
    if (DRY_RUN) continue;

    const resourceUrl = await uploadImage(p.image);
    const refs = await ingredientIds(p.ingredients);
    const meta = { ...p.meta, ...(refs.length ? { key_ingredients: refs } : {}) };
    const metafields = Object.entries(meta)
      .filter(([, v]) => v != null)
      .map(([key, v]) => ({ namespace: "worth", key, type: TYPES[key], value: Array.isArray(v) ? JSON.stringify(v) : String(v) }));

    const created = await admin(
      `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
        productCreate(product: $product, media: $media) {
          product { id variants(first: 1) { nodes { id } } }
          userErrors { field message }
        }
      }`,
      {
        product: {
          title: p.title,
          handle: p.handle,
          productType: p.productType,
          vendor: "Worth Aesthetics",
          descriptionHtml: p.descriptionHtml,
          tags: p.tags,
          status: ACTIVE ? "ACTIVE" : "DRAFT",
          metafields,
        },
        media: [{ originalSource: resourceUrl, mediaContentType: "IMAGE", alt: p.imageAlt }],
      },
    );
    check(created.productCreate, `product ${p.handle}`);
    const productId = created.productCreate.product.id;
    const variantId = created.productCreate.product.variants.nodes[0].id;

    const priced = await admin(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } }
      }`,
      {
        productId,
        variants: [{ id: variantId, price: p.price, ...(p.compareAt ? { compareAtPrice: p.compareAt } : {}), inventoryItem: { tracked: false } }],
      },
    );
    check(priced.productVariantsBulkUpdate, `price ${p.handle}`);

    if (ACTIVE && headless) {
      const pub = await admin(
        `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
        { id: productId, input: [{ publicationId: headless }] },
      );
      check(pub.publishablePublish, `publish ${p.handle}`);
    }
  }
  console.log("\nDone.");
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
