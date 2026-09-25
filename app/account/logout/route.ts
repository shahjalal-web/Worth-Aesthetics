import { NextResponse, type NextRequest } from "next/server";
import { clearSession, getEndpoints, getSession, isCustomerAccountConfigured } from "@/lib/customer/auth";
import { siteOrigin } from "../site-origin";

export async function GET(req: NextRequest) {
  const session = await getSession();
  await clearSession();
  if (!isCustomerAccountConfigured() || !session?.idToken) return NextResponse.redirect(new URL("/", req.url));

  const { openid } = await getEndpoints();
  const url = new URL(openid.end_session_endpoint);
  url.searchParams.set("id_token_hint", session.idToken);
  url.searchParams.set("post_logout_redirect_uri", `${siteOrigin(req)}/`);
  return NextResponse.redirect(url);
}
