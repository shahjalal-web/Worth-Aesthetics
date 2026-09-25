import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, idTokenNonce, saveSession, takeAuthRequest } from "@/lib/customer/auth";
import { linkCartToCustomer } from "@/lib/shopify";
import { CART_COOKIE } from "@/lib/shopify/constants";
import { siteOrigin } from "../site-origin";

/** OAuth callback: https://<site>/account/authorize */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const fail = (reason: string) => NextResponse.redirect(new URL(`/account?error=${reason}`, req.url));

  const request = await takeAuthRequest();
  if (params.get("error")) return fail("denied");
  const code = params.get("code");
  if (!request || !code || params.get("state") !== request.state) return fail("state");

  try {
    const session = await exchangeCode(code, `${siteOrigin(req)}/account/authorize`, request.verifier);
    if (idTokenNonce(session.idToken) !== request.nonce) return fail("nonce");
    await saveSession(session);

    // Cart survives login: attach the existing bag to the customer.
    const cartId = (await cookies()).get(CART_COOKIE)?.value;
    if (cartId) {
      try {
        await linkCartToCustomer(cartId, session.accessToken);
      } catch (e) {
        console.warn("linkCartToCustomer failed", e);
      }
    }
    return NextResponse.redirect(new URL(request.returnTo, req.url));
  } catch (e) {
    console.error("customer login failed", e);
    return fail("token");
  }
}
