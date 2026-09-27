"use server";

import { z } from "zod";
import { createPrivateEntry, isAdminConfigured } from "@/lib/shopify/admin";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address."),
  order: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, "Please add a little more detail.").max(3000),
});

/**
 * Stores every message privately in Shopify (metaobject `contact_message`) and,
 * when RESEND_API_KEY + CONTACT_TO_EMAIL are set, also emails the team.
 */
export async function sendContactAction(_: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get("company")) return { status: "success", message: "Message received." }; // bot

  const values = Object.fromEntries(
    ["name", "email", "order", "message"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { status: "error", errors, values };
  }

  const d = parsed.data;
  const { RESEND_API_KEY, CONTACT_TO_EMAIL } = process.env;
  let saved = false;
  let emailed = false;

  // 1) Always keep a copy in Shopify admin → Content → Metaobjects → Contact messages.
  if (isAdminConfigured()) {
    try {
      await createPrivateEntry("contact_message", {
        name: d.name,
        email: d.email,
        order_number: d.order || undefined,
        message: d.message,
        submitted_at: new Date().toISOString(),
      });
      saved = true;
    } catch (e) {
      console.error("contact save failed", e);
    }
  }

  // 2) Optionally email the team (Resend) when configured.
  if (RESEND_API_KEY && CONTACT_TO_EMAIL) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Worth Aesthetics <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL],
        reply_to: d.email,
        subject: `Website enquiry${d.order ? ` — order ${d.order}` : ""} — ${d.name}`,
        text: [`Name: ${d.name}`, `Email: ${d.email}`, `Order: ${d.order || "—"}`, "", d.message].join("\n"),
      }),
    }).catch(() => null);
    emailed = Boolean(res?.ok);
    if (res && !res.ok) console.error("contact email failed", res.status, await res.text());
  }

  if (!saved && !emailed) {
    return { status: "error", values, message: "We couldn't send your message. Please try again shortly." };
  }
  return { status: "success", message: "Thank you — we've received your message and will reply within one business day." };
}
