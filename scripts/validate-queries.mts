// Validates every GraphQL document against the live Storefront API (read-only; mutations are parsed, never executed).
// Usage: npx tsx --env-file=.env scripts/validate-queries.mts
import * as Q from "../lib/shopify/queries";
import * as M from "../lib/shopify/mutations";
const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2026-07/graphql.json`;
const vars: Record<string, object> = {
  getProductQuery: { handle: "x" }, getCollectionQuery: { handle: "frontpage" },
  getCollectionProductsQuery: { handle: "frontpage" }, getProductRecommendationsQuery: { productId: "gid://shopify/Product/1" },
  predictiveSearchQuery: { query: "serum" }, getMetaobjectsQuery: { type: "hero_slide" }, getPageQuery: { handle: "about" },
  getCartQuery: { cartId: "gid://shopify/Cart/x" },
};
for (const [name, query] of Object.entries({ ...Q, ...M }).filter(([, v]) => typeof v === "string") as [string, string][]) {
  const isMut = name.endsWith("Mutation");
  const body = isMut ? { query: query.replace(/^\s*mutation/, "query __validate_only_do_not_run__ { shop { name } }\nmutation"), operationName: "__validate_only_do_not_run__" } : { query, variables: vars[name] ?? {} };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Shopify-Storefront-Private-Token": process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN! }, body: JSON.stringify(body) });
  const j = await r.json();
  console.log(name.padEnd(34), j.errors ? "ERR " + JSON.stringify(j.errors).slice(0, 400) : "ok");
}
