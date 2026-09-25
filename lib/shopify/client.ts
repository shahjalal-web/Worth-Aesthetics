import "server-only";
import { SHOPIFY_GRAPHQL_ENDPOINT } from "./constants";

type GraphQLError = { message: string; extensions?: { code?: string } };

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly errors?: GraphQLError[],
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

export function isShopifyConfigured() {
  return Boolean(
    SHOPIFY_GRAPHQL_ENDPOINT &&
      (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN),
  );
}

/**
 * Server-only Storefront API fetch. Uses the private (server) token when
 * available; falls back to the public token. Caching is handled by the
 * caller via `"use cache"` + `cacheTag`, never here.
 */
export async function shopifyFetch<T>({
  query,
  variables,
  buyerIp,
}: {
  query: string;
  variables?: Record<string, unknown>;
  buyerIp?: string;
}): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new ShopifyError("Shopify is not configured. Check SHOPIFY_* env vars.");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (privateToken) {
    headers["Shopify-Storefront-Private-Token"] = privateToken;
    if (buyerIp) headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN!;
  }

  const res = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new ShopifyError(`Shopify request failed: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as { data?: T; errors?: GraphQLError[] };
  if (body.errors?.length) {
    throw new ShopifyError(body.errors.map((e) => e.message).join("; "), body.errors);
  }
  return body.data as T;
}
