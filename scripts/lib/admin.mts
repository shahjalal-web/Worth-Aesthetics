/**
 * Admin API helper for local setup scripts ONLY (never imported by the app).
 * Token source, in order:
 *   1. SHOPIFY_ADMIN_ACCESS_TOKEN (custom app created in Shopify admin), or
 *   2. client-credentials grant with SHOPIFY_APP_CLIENT_ID / _SECRET (Dev Dashboard app installed on the store).
 */
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";

export const DRY_RUN = process.argv.includes("--dry-run");

let cachedToken: string | undefined;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) return (cachedToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);

  const id = process.env.SHOPIFY_APP_CLIENT_ID;
  const secret = process.env.SHOPIFY_APP_CLIENT_SECRET;
  if (!domain || !id || !secret) throw new Error("Missing SHOPIFY_STORE_DOMAIN / admin credentials in .env");

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  const text = await res.text();
  if (!res.ok) {
    const reason = text.match(/Oauth error ([\w_]+)/)?.[1] ?? `${res.status}`;
    throw new Error(
      `Could not get an Admin token (${reason}). ` +
        (reason === "app_not_installed"
          ? "Install the app on the store first (Dev Dashboard → your app → Install), or set SHOPIFY_ADMIN_ACCESS_TOKEN."
          : "Check the app credentials/scopes."),
    );
  }
  const json = JSON.parse(text) as { access_token: string; scope?: string };
  console.log(`🔑 Admin token acquired (scopes: ${json.scope ?? "n/a"})`);
  return (cachedToken = json.access_token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Admin responses in one-off scripts
export async function admin<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data as T;
}

/** Throws on mutation userErrors so nothing fails silently. */
export function check(payload: { userErrors?: { field?: string[]; message: string; code?: string }[] }, label: string) {
  const errs = payload.userErrors ?? [];
  if (errs.length) throw new Error(`${label}: ${errs.map((e) => `${e.field?.join(".") ?? ""} ${e.message}`).join("; ")}`);
}

export const log = {
  create: (s: string) => console.log(`${DRY_RUN ? "[dry-run] would create" : "✅ created"}  ${s}`),
  skip: (s: string) => console.log(`⏭️  exists     ${s}`),
  info: (s: string) => console.log(`ℹ️  ${s}`),
};
