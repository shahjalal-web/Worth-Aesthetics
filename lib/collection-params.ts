import type { CollectionSort } from "./shopify";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured", sortKey: "COLLECTION_DEFAULT", reverse: false },
  { value: "best-selling", label: "Best selling", sortKey: "BEST_SELLING", reverse: false },
  { value: "newest", label: "Newest", sortKey: "CREATED", reverse: true },
  { value: "price-asc", label: "Price: low to high", sortKey: "PRICE", reverse: false },
  { value: "price-desc", label: "Price: high to low", sortKey: "PRICE", reverse: true },
] as const satisfies readonly { value: string; label: string; sortKey: CollectionSort; reverse: boolean }[];

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function resolveSort(value: string | undefined) {
  return SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
}

/** `?filter=<ProductFilter JSON>` (repeatable) → ProductFilter[] */
export function parseFilters(raw: string | string[] | undefined): Record<string, unknown>[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const out: Record<string, unknown>[] = [];
  for (const item of list.slice(0, 20)) {
    try {
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) out.push(parsed);
    } catch {
      /* ignore malformed filter */
    }
  }
  return out;
}
