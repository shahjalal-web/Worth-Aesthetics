import "server-only";
import { cookies } from "next/headers";
import { SHOPIFY_STORE_DOMAIN } from "@/lib/shopify/constants";
import { seal, unseal } from "./session";

/**
 * Shopify Customer Account API — OAuth 2.0 (authorization code + PKCE).
 * Endpoints are discovered from the shop's .well-known documents.
 * Requires SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (Headless channel → Customer Account API)
 * and an https callback: https://<site>/account/authorize
 */
export const SESSION_COOKIE = "wa_customer";
export const AUTH_COOKIE = "wa_auth";
export const SCOPES = "openid email customer-account-api:full";

export type CustomerSession = {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number; // epoch ms
};

export type AuthRequest = { state: string; nonce: string; verifier: string; returnTo: string };

export function isCustomerAccountConfigured() {
  return Boolean(process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID && SHOPIFY_STORE_DOMAIN);
}

type OpenIdConfig = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint: string };

let discovery: Promise<{ openid: OpenIdConfig; graphql: string }> | undefined;

export function getEndpoints() {
  discovery ??= (async () => {
    const [openid, api] = await Promise.all([
      fetch(`https://${SHOPIFY_STORE_DOMAIN}/.well-known/openid-configuration`).then((r) => r.json()),
      fetch(`https://${SHOPIFY_STORE_DOMAIN}/.well-known/customer-account-api`).then((r) => r.json()),
    ]);
    return { openid: openid as OpenIdConfig, graphql: (api as { graphql_api: string }).graphql_api };
  })().catch((e) => {
    discovery = undefined;
    throw e;
  });
  return discovery;
}

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function getSession(): Promise<CustomerSession | undefined> {
  return unseal<CustomerSession>((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function saveSession(session: CustomerSession) {
  (await cookies()).set(SESSION_COOKIE, seal(session), { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function saveAuthRequest(req: AuthRequest) {
  (await cookies()).set(AUTH_COOKIE, seal(req), { ...cookieOpts, maxAge: 60 * 10 });
}

export async function takeAuthRequest(): Promise<AuthRequest | undefined> {
  const store = await cookies();
  const req = unseal<AuthRequest>(store.get(AUTH_COOKIE)?.value);
  store.delete(AUTH_COOKIE);
  return req;
}

function tokenHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  const id = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!;
  const secret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
  if (secret) headers.Authorization = `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
  return headers;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
};

function toSession(t: TokenResponse, previous?: CustomerSession): CustomerSession {
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token ?? previous?.refreshToken,
    idToken: t.id_token ?? previous?.idToken,
    expiresAt: Date.now() + (t.expires_in - 60) * 1000,
  };
}

export async function exchangeCode(code: string, redirectUri: string, verifier: string) {
  const { openid } = await getEndpoints();
  const res = await fetch(openid.token_endpoint, {
    method: "POST",
    headers: tokenHeaders(),
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      redirect_uri: redirectUri,
      code,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return toSession((await res.json()) as TokenResponse);
}

export async function refreshSession(session: CustomerSession) {
  const { openid } = await getEndpoints();
  const res = await fetch(openid.token_endpoint, {
    method: "POST",
    headers: tokenHeaders(),
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      refresh_token: session.refreshToken,
    }),
  });
  if (!res.ok) return undefined;
  return toSession((await res.json()) as TokenResponse, session);
}

/** Validates the nonce inside the id_token (signature is verified by TLS to Shopify's token endpoint). */
export function idTokenNonce(idToken: string | undefined) {
  if (!idToken) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8"));
    return payload.nonce as string | undefined;
  } catch {
    return undefined;
  }
}
