import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { getEndpoints, isCustomerAccountConfigured, saveAuthRequest, SCOPES } from "@/lib/customer/auth";
import { pkceChallenge, randomString } from "@/lib/customer/session";
import { safeReturnTo, siteOrigin } from "../site-origin";

export async function GET(req: NextRequest) {
  if (!isCustomerAccountConfigured()) return NextResponse.redirect(new URL("/account", req.url));

  const { openid } = await getEndpoints();
  const state = randomString(16);
  const nonce = randomString(16);
  const verifier = randomString(48);
  await saveAuthRequest({ state, nonce, verifier, returnTo: safeReturnTo(req.nextUrl.searchParams.get("returnTo")) });

  const url = new URL(openid.authorization_endpoint);
  url.searchParams.set("client_id", process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${siteOrigin(req)}/account/authorize`);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", pkceChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("locale", "en");
  // Pre-fill (and auto-submit) the email the shopper typed on our branded sign-in page.
  const email = z.email().safeParse(req.nextUrl.searchParams.get("email")?.trim());
  if (email.success) {
    url.searchParams.set("login_hint", email.data);
    url.searchParams.set("login_hint_mode", "submit");
  }
  return NextResponse.redirect(url);
}
