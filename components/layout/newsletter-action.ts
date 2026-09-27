"use server";

import { z } from "zod";
import { adminFetch, createPrivateEntry, isAdminConfigured } from "@/lib/shopify/admin";

export type SubscribeState = { status: "idle" | "success" | "error"; message?: string };

type UserErrors = { userErrors: { field?: string[]; message: string }[] };

/**
 * Newsletter sign-up → Shopify customer with email-marketing consent (tag `newsletter`),
 * so the list is usable in Shopify Email / Klaviyo sync. Needs the `write_customers`
 * scope on the store app; until that scope is granted, sign-ups are kept privately in
 * the `newsletter_signup` metaobject so none are lost.
 */
export async function subscribeAction(_: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };
  if (formData.get("company")) return { status: "success", message: "Welcome to the Worth Letter." }; // bot trap
  const email = parsed.data;

  if (!isAdminConfigured()) return { status: "error", message: "Sign-ups open very soon — thank you for your interest." };

  try {
    if (await subscribeAsCustomer(email)) return { status: "success", message: "Welcome to the Worth Letter — you're on the list." };
    await createPrivateEntry("newsletter_signup", {
      email,
      source: String(formData.get("source") ?? "footer").slice(0, 40),
      submitted_at: new Date().toISOString(),
    });
    return { status: "success", message: "Welcome to the Worth Letter — you're on the list." };
  } catch (e) {
    console.error("newsletter failed", e);
    return { status: "error", message: "We couldn't add you just now. Please try again shortly." };
  }
}

/** Returns false when the app lacks customer write access (caller falls back). */
async function subscribeAsCustomer(email: string): Promise<boolean> {
  const consent = { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN", consentUpdatedAt: new Date().toISOString() };
  const created = await adminFetch<{ customerCreate: UserErrors & { customer: { id: string } | null } }>(
    `mutation($input: CustomerInput!) { customerCreate(input: $input) { customer { id } userErrors { field message } } }`,
    { input: { email, tags: ["newsletter"], emailMarketingConsent: consent } },
  );
  if (created.errors?.length) {
    if (created.errors.some((e) => e.extensions?.code === "ACCESS_DENIED")) return false;
    throw new Error(created.errors[0].message);
  }
  if (created.data?.customerCreate.customer) return true;

  // Existing customer → just update their consent.
  const found = await adminFetch<{ customers: { nodes: { id: string }[] } }>(
    `query($q: String!) { customers(first: 1, query: $q) { nodes { id } } }`,
    { q: `email:${email}` },
  );
  const id = found.data?.customers.nodes[0]?.id;
  if (!id) throw new Error(created.data?.customerCreate.userErrors[0]?.message ?? "customer not found");
  const updated = await adminFetch<{ customerEmailMarketingConsentUpdate: UserErrors }>(
    `mutation($input: CustomerEmailMarketingConsentUpdateInput!) {
      customerEmailMarketingConsentUpdate(input: $input) { userErrors { field message } }
    }`,
    { input: { customerId: id, emailMarketingConsent: consent } },
  );
  if (updated.errors?.some((e) => e.extensions?.code === "ACCESS_DENIED")) return false;
  const err = updated.errors?.[0]?.message ?? updated.data?.customerEmailMarketingConsentUpdate.userErrors[0]?.message;
  if (err) throw new Error(err);
  return true;
}
