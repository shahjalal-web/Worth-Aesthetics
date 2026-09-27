"use client";

import Image from "next/image";
import { useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon, LockIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const COPY: Record<Mode, { eyebrow: string; title: string; accent: string; intro: string; cta: string }> = {
  signin: {
    eyebrow: "Welcome back",
    title: "Sign",
    accent: "in",
    intro: "Enter your email and we'll send a secure one-time code. No password to remember.",
    cta: "Continue with email",
  },
  signup: {
    eyebrow: "Join the Worth Circle",
    title: "Create your",
    accent: "account",
    intro: "Your account is created the moment you verify your email — it takes under a minute.",
    cta: "Create account",
  },
};

const BENEFITS = [
  "Track every order, from lab to doorstep",
  "Saved addresses for a faster checkout",
  "Your bag follows you across devices",
  "First access to launches and private offers",
];

const ERRORS: Record<string, string> = {
  denied: "Sign-in was cancelled.",
  state: "Your sign-in session expired. Please try again.",
  nonce: "We couldn't verify your sign-in. Please try again.",
  token: "Something went wrong while signing you in. Please try again.",
};

/**
 * Branded entry to Shopify's Customer Account login (OAuth + PKCE). The email is
 * forwarded as `login_hint`, so Shopify pre-fills it and sends the one-time code.
 */
export function SignIn({ error, returnTo = "/account", initialMode = "signin" }: { error?: string; returnTo?: string; initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const copy = COPY[mode];

  return (
    <div className="mx-auto grid max-w-6xl overflow-hidden border border-line bg-bg shadow-(--shadow) lg:grid-cols-2">
      {/* Visual panel */}
      <div className="relative hidden min-h-[640px] lg:block">
        <Image
          src="/placeholder/nad-pdrn-serum.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#2d2b2a]/80 via-[#2d2b2a]/25 to-transparent" />
        <div className="pointer-events-none absolute inset-5 border border-white/35" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="eyebrow text-white/80">The Worth Circle</p>
          <p className="mt-4 text-[30px] leading-tight font-light tracking-[0.06em] uppercase">
            Your ritual, <span className="serif-italic tracking-normal normal-case">remembered</span>
          </p>
          <ul className="mt-8 space-y-3 text-[14px] text-white/90">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="h-px w-5 shrink-0 bg-white/70" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:py-16 lg:px-16">
        <LogoMark className="size-11 text-fg" />

        <div role="tablist" aria-label="Account" className="mt-10 grid grid-cols-2 border-b border-line">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "label-caps relative pb-4 text-[10.5px] transition-colors",
                mode === m ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {m === "signin" ? "Sign in" : "Create account"}
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-px h-0.5 bg-accent transition-transform duration-300 ease-(--ease-luxe)",
                  mode === m ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          ))}
        </div>

        <div key={mode} className="animate-fade-up">
          <p className="eyebrow mt-10 text-accent-ink">{copy.eyebrow}</p>
          <h1 className="mt-3 text-[30px] leading-tight font-light tracking-[0.08em] uppercase md:text-[36px]">
            {copy.title} <span className="serif-italic tracking-normal normal-case text-accent-ink">{copy.accent}</span>
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">{copy.intro}</p>
        </div>

        {error && ERRORS[error] && (
          <p role="alert" className="mt-6 border-l-2 border-accent bg-surface px-4 py-3 text-[13px]">
            {ERRORS[error]}
          </p>
        )}

        <form action="/account/login" method="get" className="mt-8">
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="block">
            <span className="label-caps text-[10px]">Email address</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className="mt-2 h-13 w-full border border-line bg-bg px-4 text-[15px] placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </label>
          <button type="submit" className={buttonClasses({ size: "lg", className: "group mt-5 w-full" })}>
            {copy.cta}
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </form>

        <div className="my-7 flex items-center gap-4 text-[11px] tracking-[0.2em] text-muted uppercase">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <a
          href={`/account/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="flex h-13 w-full items-center justify-center gap-3 bg-[#5a31f4] font-display text-[12px] font-medium tracking-[0.12em] text-white uppercase transition-[filter] hover:brightness-110"
        >
          Continue with <span className="text-[15px] font-semibold tracking-normal normal-case">Shop</span>
        </a>

        <ol className="mt-10 grid grid-cols-3 gap-3 border-t border-line pt-8 text-center">
          {["Enter email", "Receive code", "You're in"].map((step, i) => (
            <li key={step}>
              <span className="mx-auto flex size-8 items-center justify-center rounded-full border border-line-strong font-display text-[11px] text-accent-ink">
                {i + 1}
              </span>
              <span className="mt-2 block text-[11.5px] text-muted">{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 flex items-center justify-center gap-2 text-[11.5px] text-muted">
          <LockIcon className="size-3.5" />
          Secure sign-in powered by Shopify
        </p>
      </div>
    </div>
  );
}
