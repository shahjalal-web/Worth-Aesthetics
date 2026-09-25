"use client";

/**
 * Consent-aware analytics (GA4 + Meta Pixel). Nothing fires until the visitor
 * grants consent via the banner; see components/consent/*.
 */
export type Consent = { analytics: boolean; marketing: boolean; preferences: boolean; saleOfData: boolean };

export const CONSENT_KEY = "wa-consent";
export const CONSENT_EVENT = "wa:consent";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function writeConsent(c: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  } catch {
    /* storage blocked — consent applies for this page view only */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
}

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
    dataLayer?: unknown[];
  }
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity?: number;
};

/** GA4 standard e-commerce event + Meta equivalent. Safe no-op without consent. */
export function track(
  event: "view_item" | "add_to_cart" | "begin_checkout" | "view_item_list" | "search",
  params: { currency?: string; value?: number; items?: AnalyticsItem[]; search_term?: string },
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  const meta: Record<string, string> = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    search: "Search",
  };
  if (meta[event]) {
    window.fbq?.("track", meta[event], {
      currency: params.currency,
      value: params.value,
      content_ids: params.items?.map((i) => i.item_id),
      content_type: "product",
      search_string: params.search_term,
    });
  }
}

export const idFromGid = (gid: string) => gid.split("/").pop() ?? gid;
