"use server";

import { z } from "zod";

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
 * Sends the message via Resend when RESEND_API_KEY + CONTACT_TO_EMAIL are set.
 * TBC: client to confirm the support inbox / email provider.
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

  const { RESEND_API_KEY, CONTACT_TO_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    return {
      status: "error",
      values,
      message: "Our contact form is being connected. Please email us directly in the meantime.",
    };
  }

  const d = parsed.data;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Worth Aesthetics <onboarding@resend.dev>",
      to: [CONTACT_TO_EMAIL],
      reply_to: d.email,
      subject: `Website enquiry${d.order ? ` — order ${d.order}` : ""} — ${d.name}`,
      text: `Name: ${d.name}\nEmail: ${d.email}\nOrder: ${d.order || "—"}\n\n${d.message}`,
    }),
  });
  if (!res.ok) {
    console.error("contact send failed", res.status, await res.text());
    return { status: "error", values, message: "We couldn't send your message. Please try again shortly." };
  }
  return { status: "success", message: "We've received your message and will reply within one business day." };
}
