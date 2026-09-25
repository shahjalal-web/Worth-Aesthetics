import type { NextRequest } from "next/server";

/** Public origin for OAuth redirects (Shopify requires https — use the deployed domain or a tunnel in dev). */
export function siteOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured?.startsWith("https://")) return configured.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

/** Only allow same-site relative return paths. */
export function safeReturnTo(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}
