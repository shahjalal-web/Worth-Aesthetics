/**
 * Creates the metaobject + product metafield definitions the storefront reads.
 * Idempotent (skips anything that exists), never deletes, logs every change.
 *
 *   npx tsx --env-file=.env scripts/setup-metafields.mts --dry-run   # preview
 *   npx tsx --env-file=.env scripts/setup-metafields.mts             # apply
 *
 * Required Admin scopes: read/write_metaobject_definitions, read/write_products.
 */
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";

type FieldDef = { key: string; name: string; type: string; required?: boolean };

const METAOBJECTS: { type: string; name: string; displayNameKey: string; fields: FieldDef[] }[] = [
  {
    type: "ingredient",
    name: "Ingredient",
    displayNameKey: "name",
    fields: [
      { key: "name", name: "Name", type: "single_line_text_field", required: true },
      { key: "inci", name: "INCI name", type: "single_line_text_field" },
      { key: "short_description", name: "Short description", type: "multi_line_text_field" },
      { key: "image", name: "Image", type: "file_reference" },
    ],
  },
  {
    type: "faq_item",
    name: "FAQ item",
    displayNameKey: "question",
    fields: [
      { key: "question", name: "Question", type: "single_line_text_field", required: true },
      { key: "answer", name: "Answer", type: "multi_line_text_field", required: true },
      { key: "category", name: "Category", type: "single_line_text_field" },
    ],
  },
  {
    type: "hero_slide",
    name: "Hero slide",
    displayNameKey: "headline",
    fields: [
      { key: "eyebrow", name: "Eyebrow", type: "single_line_text_field" },
      { key: "headline", name: "Headline", type: "single_line_text_field", required: true },
      { key: "subline", name: "Subline", type: "multi_line_text_field" },
      { key: "cta_label", name: "Button label", type: "single_line_text_field" },
      { key: "cta_link", name: "Button link", type: "single_line_text_field" },
      { key: "image", name: "Image", type: "file_reference" },
    ],
  },
  {
    type: "announcement",
    name: "Announcement",
    displayNameKey: "text",
    fields: [{ key: "text", name: "Text", type: "single_line_text_field", required: true }],
  },
  {
    type: "testimonial",
    name: "Testimonial",
    displayNameKey: "author",
    fields: [
      { key: "quote", name: "Quote", type: "multi_line_text_field", required: true },
      { key: "author", name: "Author", type: "single_line_text_field", required: true },
      { key: "product", name: "Product", type: "product_reference" },
    ],
  },
];

type MetafieldDef = { key: string; name: string; type: string; description: string; metaobject?: string; filterable?: boolean };

const PRODUCT_METAFIELDS: MetafieldDef[] = [
  { key: "subtitle", name: "Subtitle", type: "single_line_text_field", description: "Short card tagline" },
  { key: "active_complex", name: "Active complex", type: "single_line_text_field", description: "Italic subline, e.g. Copper Tripeptide-1 + Snap-8" },
  { key: "size_label", name: "Size label", type: "single_line_text_field", description: "e.g. 30 ML / 1.0 FL. OZ." },
  { key: "badge", name: "Badge", type: "single_line_text_field", description: "New / Bestseller / Limited" },
  { key: "routine_step", name: "Routine step", type: "single_line_text_field", description: "AM/PM ordering, e.g. 2 — Serum" },
  { key: "benefits", name: "Benefits", type: "list.single_line_text_field", description: "Bullet benefits on the product page" },
  { key: "skin_concerns", name: "Skin concerns", type: "list.single_line_text_field", description: "Used for filters and the routine quiz", filterable: true },
  { key: "skin_types", name: "Skin types", type: "list.single_line_text_field", description: "Used for filters", filterable: true },
  { key: "results_claims", name: "Results claims", type: "list.single_line_text_field", description: "Substantiated claims only" },
  { key: "how_to_use", name: "How to use", type: "rich_text_field", description: "Product page accordion" },
  { key: "full_ingredients_inci", name: "Full ingredients (INCI)", type: "multi_line_text_field", description: "Product page accordion" },
  { key: "key_ingredients", name: "Key ingredients", type: "list.metaobject_reference", metaobject: "ingredient", description: "Ingredient spotlight" },
  { key: "faq", name: "FAQ", type: "list.metaobject_reference", metaobject: "faq_item", description: "Product FAQ" },
  { key: "pairs_well_with", name: "Pairs well with", type: "list.product_reference", description: "Cross-sell on product page & bag" },
];

async function ensureMetaobjects() {
  const ids: Record<string, string> = {};
  for (const def of METAOBJECTS) {
    const existing = await admin<{ metaobjectDefinitionByType: { id: string } | null }>(
      `query($type: String!) { metaobjectDefinitionByType(type: $type) { id } }`,
      { type: def.type },
    );
    if (existing.metaobjectDefinitionByType) {
      ids[def.type] = existing.metaobjectDefinitionByType.id;
      log.skip(`metaobject definition "${def.type}"`);
      continue;
    }
    log.create(`metaobject definition "${def.type}" (${def.fields.length} fields)`);
    if (DRY_RUN) continue;
    const res = await admin(
      `mutation($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id }
          userErrors { field message code }
        }
      }`,
      {
        definition: {
          type: def.type,
          name: def.name,
          displayNameKey: def.displayNameKey,
          access: { storefront: "PUBLIC_READ" },
          fieldDefinitions: def.fields.map((f) => ({ key: f.key, name: f.name, type: f.type, required: f.required ?? false })),
        },
      },
    );
    check(res.metaobjectDefinitionCreate, `metaobject ${def.type}`);
    ids[def.type] = res.metaobjectDefinitionCreate.metaobjectDefinition.id;
  }
  return ids;
}

async function ensureProductMetafields(metaobjectIds: Record<string, string>) {
  const existing = await admin<{ metafieldDefinitions: { nodes: { key: string }[] } }>(
    `query { metafieldDefinitions(first: 100, ownerType: PRODUCT, namespace: "worth") { nodes { key } } }`,
  );
  const have = new Set(existing.metafieldDefinitions.nodes.map((n) => n.key));

  for (const def of PRODUCT_METAFIELDS) {
    if (have.has(def.key)) {
      log.skip(`product metafield worth.${def.key}`);
      continue;
    }
    log.create(`product metafield worth.${def.key} (${def.type})`);
    if (DRY_RUN) continue;

    const validations =
      def.metaobject && metaobjectIds[def.metaobject]
        ? [{ name: "metaobject_definition_id", value: metaobjectIds[def.metaobject] }]
        : undefined;

    const res = await admin(
      `mutation($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id }
          userErrors { field message code }
        }
      }`,
      {
        definition: {
          namespace: "worth",
          key: def.key,
          name: def.name,
          description: def.description,
          type: def.type,
          ownerType: "PRODUCT",
          access: { storefront: "PUBLIC_READ" },
          ...(validations ? { validations } : {}),
          ...(def.filterable ? { capabilities: { smartCollectionCondition: { enabled: true } } } : {}),
        },
      },
    );
    check(res.metafieldDefinitionCreate, `metafield worth.${def.key}`);
  }
}

console.log(`\nWorth Aesthetics — metafield setup ${DRY_RUN ? "(DRY RUN — no changes)" : ""}\n`);
try {
  const ids = await ensureMetaobjects();
  await ensureProductMetafields(ids);
  console.log("\nDone.");
  if (!DRY_RUN) {
    log.info("Next: Search & Discovery app → Filters → add worth.skin_concerns and worth.skin_types.");
  }
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
