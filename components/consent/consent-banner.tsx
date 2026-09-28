"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { readConsent, writeConsent, type Consent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const SHOPIFY_PRIVACY_SRC = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js";

type ShopifyPrivacy = {
  customerPrivacy?: {
    setTrackingConsent: (consent: Record<string, unknown>, cb: (r?: { error?: string }) => void) => void;
  };
};

/** Mirrors the visitor's choice to Shopify's Customer Privacy API so checkout & Shopify analytics respect it. */
function syncWithShopify(c: Consent) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
  if (!domain || !token) return;
  const apply = () => {
    const w = window as unknown as { Shopify?: ShopifyPrivacy };
    w.Shopify?.customerPrivacy?.setTrackingConsent(
      {
        analytics: c.analytics,
        marketing: c.marketing,
        preferences: c.preferences,
        sale_of_data: c.saleOfData,
        headlessStorefront: true,
        checkoutRootDomain: domain,
        // Root domain (no "www.") so the consent cookie is shared with checkout.<domain>.
        storefrontRootDomain: window.location.hostname.replace(/^www\./, ""),
        storefrontAccessToken: token,
      },
      () => undefined,
    );
  };
  if (document.getElementById("shopify-privacy")) return apply();
  const s = document.createElement("script");
  s.id = "shopify-privacy";
  s.src = SHOPIFY_PRIVACY_SRC;
  s.async = true;
  s.onload = apply;
  document.head.appendChild(s);
}

export const OPEN_CONSENT_EVENT = "wa:open-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [prefs, setPrefs] = useState<Consent>({ analytics: true, marketing: true, preferences: true, saleOfData: true });

  useEffect(() => {
    const existing = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
    if (!existing) setVisible(true);
    else setPrefs(existing);
    const open = () => {
      setCustom(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const decide = (c: Consent) => {
    writeConsent(c);
    syncWithShopify(c);
    setVisible(false);
    setCustom(false);
  };

  if (!visible) return null;

  const toggles: { key: keyof Consent; label: string; text: string }[] = [
    { key: "analytics", label: "Analytics", text: "Helps us understand how the site is used." },
    { key: "marketing", label: "Marketing", text: "Personalised ads and measuring campaigns." },
    { key: "preferences", label: "Preferences", text: "Remembers your choices, like region." },
    { key: "saleOfData", label: "Sale / sharing of data", text: "Sharing with partners for targeted advertising (US state laws)." },
  ];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="animate-fade-up fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl border border-line bg-bg p-6 shadow-(--shadow) md:inset-x-auto md:right-6 md:bottom-6 md:p-7"
    >
      <p id="consent-title" className="label-caps text-[10.5px]">
        Your privacy
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        We use cookies to run the store, and — with your permission — for analytics and marketing. See our{" "}
        <Link href="/policies/privacy-policy" className="text-fg underline decoration-accent underline-offset-4">
          privacy policy
        </Link>
        .
      </p>

      {custom && (
        <ul className="mt-5 space-y-3 border-t border-line pt-5">
          {toggles.map((t) => (
            <li key={t.key}>
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block text-[13px]">{t.label}</span>
                  <span className="block text-[12px] text-muted">{t.text}</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs[t.key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [t.key]: e.target.checked }))}
                  className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className={cn("mt-5 flex flex-wrap items-center gap-3")}>
        {custom ? (
          <Button size="sm" onClick={() => decide(prefs)}>
            Save choices
          </Button>
        ) : (
          <Button size="sm" onClick={() => decide({ analytics: true, marketing: true, preferences: true, saleOfData: true })}>
            Accept all
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => decide({ analytics: false, marketing: false, preferences: false, saleOfData: false })}>
          Reject non-essential
        </Button>
        {!custom && (
          <button type="button" onClick={() => setCustom(true)} className="text-[12px] text-muted underline underline-offset-4 hover:text-fg">
            Customise
          </button>
        )}
      </div>
    </div>
  );
}

/** Footer link: "Your privacy choices" — reopens the banner. */
export function PrivacyChoicesLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className={className}>
      Your privacy choices
    </button>
  );
}
