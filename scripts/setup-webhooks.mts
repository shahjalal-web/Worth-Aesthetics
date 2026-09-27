/**
 * Registers Shopify webhooks → /api/revalidate so edits in Shopify refresh the
 * site within seconds. Idempotent (skips existing topic+URL pairs), never deletes.
 *
 *   npx tsx --env-file=.env scripts/setup-webhooks.mts --url https://www.example.com --dry-run
 *   npx tsx --env-file=.env scripts/setup-webhooks.mts --url https://www.example.com
 *
 * App-created webhooks are signed with the app's client secret, which is what
 * SHOPIFY_REVALIDATION_SECRET must contain.
 */
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";

const i = process.argv.indexOf("--url");
const base = i > -1 ? process.argv[i + 1] : process.env.NEXT_PUBLIC_SITE_URL;
if (!base?.startsWith("https://")) {
  console.error("❌ Pass the public https site URL: --url https://your-domain.com");
  process.exit(1);
}
const callbackUrl = `${base.replace(/\/$/, "")}/api/revalidate`;

// Metaobject topics require a filter naming the types to watch (storefront content types only).
const CONTENT_FILTER = ["ingredient", "faq_item", "hero_slide", "announcement", "testimonial"].map((t) => `type:${t}`).join(" OR ");
const FILTERS: Record<string, string> = {
  METAOBJECTS_CREATE: CONTENT_FILTER,
  METAOBJECTS_UPDATE: CONTENT_FILTER,
  METAOBJECTS_DELETE: CONTENT_FILTER,
};

const TOPICS = [
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "PRODUCTS_DELETE",
  "COLLECTIONS_CREATE",
  "COLLECTIONS_UPDATE",
  "COLLECTIONS_DELETE",
  "INVENTORY_LEVELS_UPDATE",
  // Content: FAQ / ingredients / announcements / hero slides / testimonials (metaobjects) and shop settings.
  "METAOBJECTS_CREATE",
  "METAOBJECTS_UPDATE",
  "METAOBJECTS_DELETE",
  "SHOP_UPDATE",
];

console.log(`\nWebhooks → ${callbackUrl} ${DRY_RUN ? "(DRY RUN)" : ""}\n`);
try {
  const existing = await admin<{ webhookSubscriptions: { nodes: { topic: string; uri: string }[] } }>(
    `query { webhookSubscriptions(first: 100) { nodes { topic uri } } }`,
  );
  for (const topic of TOPICS) {
    if (existing.webhookSubscriptions.nodes.some((w) => w.topic === topic && w.uri === callbackUrl)) {
      log.skip(topic);
      continue;
    }
    log.create(topic);
    if (DRY_RUN) continue;
    const res = await admin(
      `mutation($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) {
          webhookSubscription { id }
          userErrors { field message }
        }
      }`,
      { topic, sub: { uri: callbackUrl, format: "JSON", ...(FILTERS[topic] ? { filter: FILTERS[topic] } : {}) } },
    );
    check(res.webhookSubscriptionCreate, topic);
  }
  console.log("\nDone.");
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
