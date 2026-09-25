"use server";

import { z } from "zod";

export type SubscribeState = { status: "idle" | "success" | "error"; message?: string };

/**
 * TBC: email provider (Klaviyo vs Shopify customer marketing) is not decided.
 * Until it is, we validate but do NOT pretend the address was stored.
 */
export async function subscribeAction(_: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };

  if (!process.env.KLAVIYO_PUBLIC_KEY) {
    return {
      status: "error",
      message: "Sign-ups open very soon — thank you for your interest.",
    };
  }

  // Klaviyo client subscription API integration goes here once confirmed.
  return { status: "success", message: "Welcome. Please check your inbox to confirm." };
}
