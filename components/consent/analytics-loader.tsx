"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONSENT_EVENT, readConsent, type Consent } from "@/lib/analytics/client";

const GA4 = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function inject(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGa4() {
  if (!GA4 || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4, { send_page_view: false });
  inject("ga4", `https://www.googletagmanager.com/gtag/js?id=${GA4}`);
}

function loadPixel() {
  if (!PIXEL || window.fbq) return;
  const queue: unknown[][] = [];
  const fbq = function (...args: unknown[]) {
    queue.push(args);
  } as ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
  fbq.queue = queue;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  inject("meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", PIXEL);
}

/** Loads GA4 / Meta Pixel only after consent, and sends SPA page views. */
export function AnalyticsLoader() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
    setConsent(readConsent());
    const onChange = (e: Event) => setConsent((e as CustomEvent<Consent>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (consent?.analytics) loadGa4();
    if (consent?.marketing) loadPixel();
  }, [consent]);

  useEffect(() => {
    if (!consent || last.current === pathname) return;
    last.current = pathname;
    if (consent.analytics) window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href });
    if (consent.marketing) window.fbq?.("track", "PageView");
  }, [pathname, consent]);

  return null;
}
