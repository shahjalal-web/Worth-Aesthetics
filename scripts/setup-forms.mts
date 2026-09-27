/**
 * Creates the PRIVATE metaobject definitions that store website form submissions
 * (not readable by the Storefront API — admin only). Idempotent; never deletes.
 *
 *   npx tsx --env-file=.env scripts/setup-forms.mts --dry-run
 *   npx tsx --env-file=.env scripts/setup-forms.mts
 *
 * Entries appear in Shopify admin → Content → Metaobjects → "Contact messages" / "Newsletter sign-ups".
 */
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";

const DEFINITIONS = [
  {
    type: "contact_message",
    name: "Contact messages",
    displayNameKey: "email",
    fields: [
      { key: "name", name: "Name", type: "single_line_text_field", required: true },
      { key: "email", name: "Email", type: "single_line_text_field", required: true },
      { key: "order_number", name: "Order number", type: "single_line_text_field" },
      { key: "message", name: "Message", type: "multi_line_text_field", required: true },
      { key: "submitted_at", name: "Submitted at", type: "date_time" },
    ],
  },
  {
    type: "newsletter_signup",
    name: "Newsletter sign-ups",
    displayNameKey: "email",
    fields: [
      { key: "email", name: "Email", type: "single_line_text_field", required: true },
      { key: "source", name: "Source", type: "single_line_text_field" },
      { key: "submitted_at", name: "Submitted at", type: "date_time" },
    ],
  },
];

console.log(`\nWorth Aesthetics — form storage setup ${DRY_RUN ? "(DRY RUN — no changes)" : ""}\n`);
try {
  for (const def of DEFINITIONS) {
    const existing = await admin<{ metaobjectDefinitionByType: { id: string } | null }>(
      `query($type: String!) { metaobjectDefinitionByType(type: $type) { id } }`,
      { type: def.type },
    );
    if (existing.metaobjectDefinitionByType) {
      log.skip(`metaobject definition "${def.type}"`);
      continue;
    }
    log.create(`metaobject definition "${def.type}" (private — admin only)`);
    if (DRY_RUN) continue;
    const res = await admin(
      `mutation($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id } userErrors { field message code } }
      }`,
      {
        definition: {
          type: def.type,
          name: def.name,
          displayNameKey: def.displayNameKey,
          access: { storefront: "NONE" },
          fieldDefinitions: def.fields.map((f) => ({ key: f.key, name: f.name, type: f.type, required: f.required ?? false })),
        },
      },
    );
    check(res.metaobjectDefinitionCreate, `metaobject ${def.type}`);
  }
  console.log("\nDone.");
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
