"use client";

import { useActionState } from "react";
import { subscribeAction, type SubscribeState } from "./newsletter-action";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribeAction, {
    status: "idle",
  });

  return (
    <form action={action} className="w-full" noValidate>
      <div
        className={cn(
          "flex items-center border-b transition-colors focus-within:border-accent",
          tone === "dark" ? "border-band-fg/30" : "border-line-strong",
        )}
      >
        <label htmlFor={`nl-email-${tone}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-email-${tone}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Your email address"
          className={cn(
            "h-12 flex-1 bg-transparent text-[14px] outline-none",
            tone === "dark" ? "placeholder:text-band-muted" : "placeholder:text-muted",
          )}
          aria-invalid={state.status === "error"}
          aria-describedby={`nl-msg-${tone}`}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center gap-2 pl-4 font-display text-[10.5px] font-medium tracking-[0.2em] uppercase transition-colors hover:text-accent disabled:opacity-50"
        >
          {pending ? "…" : "Join"} <ArrowRightIcon className="size-4" />
        </button>
      </div>
      <p
        id={`nl-msg-${tone}`}
        aria-live="polite"
        className={cn(
          "mt-3 min-h-5 text-[12px]",
          state.status === "error" ? "text-accent" : tone === "dark" ? "text-band-muted" : "text-muted",
        )}
      >
        {state.message ??
          "By subscribing you agree to receive marketing emails. Unsubscribe at any time."}
      </p>
    </form>
  );
}
