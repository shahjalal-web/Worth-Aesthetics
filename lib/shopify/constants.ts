/**
 * Shopify Storefront API version — pinned in one place.
 * 2026-07 is the latest stable release as of Sep 2026 (2026-10 is still RC).
 */
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";

export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";

export const SHOPIFY_GRAPHQL_ENDPOINT = SHOPIFY_STORE_DOMAIN
  ? `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
  : "";

/** Metafield namespace used for all custom product content. */
export const WA_NAMESPACE = "worth"; // Shopify requires ≥ 3 chars, so not "wa"

/** Cache tags used with `cacheTag` / `revalidateTag`. */
export const TAGS = {
  products: "products",
  collections: "collections",
  content: "content",
  cart: "cart",
} as const;

export const CART_COOKIE = "wa_cart_id";

export const HIDDEN_PRODUCT_TAG = "hidden";

export const DEFAULT_OPTION = "Default Title";
