/**
 * Seeds the DEMO catalogue (scripts/demo-catalog.mts) so every collection has depth.
 * Renders placeholder packshots, uploads them, creates products (multi-size variants
 * where defined), sets `worth.*` metafields and publishes to the Headless channel.
 * Idempotent by handle — existing products are skipped; nothing is ever deleted.
 *
 *   npx tsx --env-file=.env scripts/seed-demo-products.mts --dry-run
 *   npx tsx --env-file=.env scripts/seed-demo-products.mts
 *
 * All products are tagged `demo` + `tbc` → archive them in Shopify admin when the real range is ready.
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";
import { DEMO_PRODUCTS } from "./demo-catalog.mts";
import { renderImages } from "./generate-placeholder-images.mts";

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

const HOW_TO: Record<string, string> = {
  Serum: "Morning and evening, apply a few drops to cleansed face and neck. Press gently until absorbed, then follow with moisturizer. Use SPF in the morning.",
  Cream: "Morning and evening, smooth a pearl-sized amount over face and neck as the final step of your routine.",
  Cleanser: "Massage a small amount onto damp skin for 30 seconds, then rinse with lukewarm water. Use morning and evening.",
  Set: "Use each formula as directed on its carton — cleanse, treat, then seal with cream.",
};

const howTo = (text: string) =>
  JSON.stringify({ type: "root", children: [{ type: "paragraph", children: [{ type: "text", value: text }] }] });

const OUT = path.join(process.cwd(), "public", "placeholder", "demo");

async function upload(file: string): Promise<string> {
  const full = path.join(OUT, file);
  const [bytes, info] = await Promise.all([readFile(full), stat(full)]);
  const staged = await admin(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } }
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
    else log.info(`ingredient "${handle}" not found — skipped`);
  }
  return ids;
}

console.log(`\nWorth Aesthetics — DEMO product seed ${DRY_RUN ? "(DRY RUN — no changes)" : "(ACTIVE)"}\n`);
try {
  const pubs = await admin<{ publications: { nodes: { id: string; name: string }[] } }>(`query { publications(first: 25) { nodes { id name } } }`);
  const headless = pubs.publications.nodes.find((p) => /headless/i.test(p.name))?.id;
  if (!headless) log.info("Headless publication not found — products will be created but not published");

  const todo = [];
  for (const p of DEMO_PRODUCTS) {
    const found = await admin<{ productByIdentifier: { id: string } | null }>(
      `query($h: String!) { productByIdentifier(identifier: { handle: $h }) { id } }`,
      { h: p.handle },
    );
    if (found.productByIdentifier) log.skip(`product /${p.handle}`);
    else {
      const prices = p.variants.map((v) => `${v.size} $${v.price}${v.compareAt ? ` (was $${v.compareAt})` : ""}`).join(", ");
      log.create(`product /${p.handle} — ${p.productType} · ${prices} · tags: ${[...p.tags, "demo", "tbc"].join(", ")}`);
      todo.push(p);
    }
  }
  if (DRY_RUN || !todo.length) {
    console.log("\nDone.");
    process.exit(0);
  }

  await renderImages(todo.map((p) => ({ name: p.handle, shape: p.shape, tone: p.tone })), OUT);

  for (const p of todo) {
    const media = [];
    for (const n of [1, 2]) {
      media.push({
        originalSource: await upload(`${p.handle}-${n}.jpg`),
        mediaContentType: "IMAGE",
        alt: n === 1 ? `Worth Aesthetics ${p.title}` : `${p.title} on a travertine pedestal`,
      });
    }
    const refs = await ingredientIds(p.ingredients);
    const meta: Record<string, string | string[] | undefined> = {
      ...p.meta,
      ...(HOW_TO[p.productType] ? { how_to_use: howTo(HOW_TO[p.productType]) } : {}),
      ...(refs.length ? { key_ingredients: refs } : {}),
    };
    const metafields = Object.entries(meta)
      .filter(([, v]) => v != null)
      .map(([key, v]) => ({ namespace: "worth", key, type: TYPES[key], value: Array.isArray(v) ? JSON.stringify(v) : String(v) }));

    const multi = p.variants.length > 1;
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
          tags: [...p.tags, "demo", "tbc"],
          status: "ACTIVE",
          metafields,
          ...(multi ? { productOptions: [{ name: "Size", values: p.variants.map((v) => ({ name: v.size })) }] } : {}),
        },
        media,
      },
    );
    check(created.productCreate, `product ${p.handle}`);
    const productId = created.productCreate.product.id;
    const firstVariantId = created.productCreate.product.variants.nodes[0].id;

    if (multi) {
      // productCreate only makes the first option value's variant — recreate the full set.
      const bulk = await admin(
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) { userErrors { field message } }
        }`,
        {
          productId,
          variants: p.variants.map((v) => ({
            optionValues: [{ optionName: "Size", name: v.size }],
            price: v.price,
            ...(v.compareAt ? { compareAtPrice: v.compareAt } : {}),
            inventoryItem: { tracked: false },
          })),
        },
      );
      check(bulk.productVariantsBulkCreate, `variants ${p.handle}`);
    } else {
      const v = p.variants[0];
      const priced = await admin(
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } }
        }`,
        { productId, variants: [{ id: firstVariantId, price: v.price, ...(v.compareAt ? { compareAtPrice: v.compareAt } : {}), inventoryItem: { tracked: false } }] },
      );
      check(priced.productVariantsBulkUpdate, `price ${p.handle}`);
    }

    if (headless) {
      const pub = await admin(
        `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
        { id: productId, input: [{ publicationId: headless }] },
      );
      check(pub.publishablePublish, `publish ${p.handle}`);
    }
    console.log(`   ↳ published /${p.handle}`);
  }
  console.log("\nDone.");
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
