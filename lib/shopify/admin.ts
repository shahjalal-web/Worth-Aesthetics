import "server-only";

/**
 * Minimal Admin API client for SERVER ACTIONS ONLY (contact form + newsletter).
 * The token is minted per server instance via the client-credentials grant of the
 * store's own app and never leaves the server. Scopes used: write_metaobjects,
 * write_customers (newsletter consent).
 *
 * Note: CLAUDE.md originally limited the Admin API to local scripts; the owner asked
 * for working forms without a third-party provider, so this narrow server-side use
 * was added deliberately (documented in docs/WORK_HISTORY.md).
 */
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";

let token: { value: string; expires: number } | undefined;

export function isAdminConfigured() {
  return Boolean(
    domain && (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || (process.env.SHOPIFY_APP_CLIENT_ID && process.env.SHOPIFY_APP_CLIENT_SECRET)),
  );
}

async function getToken() {
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (token && token.expires > Date.now()) return token.value;
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_APP_CLIENT_ID!,
      client_secret: process.env.SHOPIFY_APP_CLIENT_SECRET!,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin token request failed (${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  // Refresh a little early; default to 1 hour if Shopify doesn't say.
  token = { value: json.access_token, expires: Date.now() + ((json.expires_in ?? 3600) - 300) * 1000 };
  return token.value;
}

export type AdminResult<T> = { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };

export async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<AdminResult<T>> {
  const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await getToken() },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin API ${res.status}`);
  return (await res.json()) as AdminResult<T>;
}

/** Saves a private metaobject entry (visible only in Shopify admin → Content → Metaobjects). */
export async function createPrivateEntry(type: string, fields: Record<string, string | undefined>) {
  const r = await adminFetch<{ metaobjectCreate: { metaobject: { id: string } | null; userErrors: { message: string }[] } }>(
    `mutation($m: MetaobjectCreateInput!) { metaobjectCreate(metaobject: $m) { metaobject { id } userErrors { message } } }`,
    {
      m: {
        type,
        fields: Object.entries(fields)
          .filter(([, v]) => v)
          .map(([key, value]) => ({ key, value })),
      },
    },
  );
  const err = r.errors?.[0]?.message ?? r.data?.metaobjectCreate.userErrors[0]?.message;
  if (err) throw new Error(err);
}
