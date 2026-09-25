"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendContactAction, type ContactState } from "./actions";

const field =
  "mt-2 w-full border border-line bg-bg px-4 text-[14px] transition-colors placeholder:text-muted focus:border-accent focus:outline-none";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactAction, { status: "idle" });

  if (state.status === "success") {
    return (
      <div role="status" className="border border-line bg-bg-soft p-10 text-center">
        <p className="serif-italic text-3xl">Thank you</p>
        <p className="mt-3 text-[14px] text-muted">{state.message}</p>
      </div>
    );
  }

  const err = (k: string) => state.errors?.[k];

  return (
    <form action={action} className="grid gap-6 sm:grid-cols-2" noValidate>
      <label className="block">
        <span className="label-caps text-[10.5px]">Name</span>
        <input name="name" autoComplete="name" required defaultValue={state.values?.name} className={cn(field, "h-12")} aria-invalid={!!err("name")} />
        {err("name") && <span className="mt-1 block text-[12px] text-accent-ink">{err("name")}</span>}
      </label>
      <label className="block">
        <span className="label-caps text-[10.5px]">Email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={cn(field, "h-12")} aria-invalid={!!err("email")} />
        {err("email") && <span className="mt-1 block text-[12px] text-accent-ink">{err("email")}</span>}
      </label>
      <label className="block sm:col-span-2">
        <span className="label-caps text-[10.5px]">Order number (optional)</span>
        <input name="order" defaultValue={state.values?.order} placeholder="#1001" className={cn(field, "h-12")} />
      </label>
      <label className="block sm:col-span-2">
        <span className="label-caps text-[10.5px]">Message</span>
        <textarea name="message" rows={6} required defaultValue={state.values?.message} className={cn(field, "resize-none py-3")} aria-invalid={!!err("message")} />
        {err("message") && <span className="mt-1 block text-[12px] text-accent-ink">{err("message")}</span>}
      </label>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="sm:col-span-2">
        {state.status === "error" && state.message && (
          <p role="alert" className="mb-4 text-[13px] text-accent-ink">
            {state.message}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
