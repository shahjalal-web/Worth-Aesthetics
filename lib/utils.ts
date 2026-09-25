import type { Image, Money } from "./shopify/types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(money: Money | { amount: number; currencyCode: string }) {
  const amount = typeof money.amount === "string" ? parseFloat(money.amount) : money.amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toNumber(money: Money | null | undefined) {
  return money ? parseFloat(money.amount) : 0;
}

/** Percentage saved between compare-at and price, rounded. */
export function savingsPercent(price: Money, compareAt: Money | null | undefined) {
  const p = toNumber(price);
  const c = toNumber(compareAt);
  if (!c || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}

/** Shopify CDN image transform (width) — keeps next/image requests small. */
export function shopifyImage(image: Image | null | undefined, width?: number) {
  if (!image) return null;
  if (!width || !image.url.includes("cdn.shopify.com")) return image.url;
  const url = new URL(image.url);
  url.searchParams.set("width", String(width));
  return url.toString();
}

export function absoluteUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}
