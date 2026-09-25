"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { Filter } from "@/lib/shopify/types";
import { SORT_OPTIONS } from "@/lib/collection-params";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";

/** Filters come from Shopify Search & Discovery; each value carries its own `input` JSON. */
export function CollectionToolbar({ filters, count }: { filters: Filter[]; count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const active = params.getAll("filter");
  const sort = params.get("sort") ?? "featured";

  const push = (next: URLSearchParams) =>
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });

  const toggle = (input: string) => {
    const next = new URLSearchParams(params);
    next.delete("filter");
    const set = new Set(active);
    if (set.has(input)) set.delete(input);
    else set.add(input);
    set.forEach((f) => next.append("filter", f));
    push(next);
  };

  const setPrice = (min: string, max: string) => {
    const next = new URLSearchParams(params);
    next.delete("filter");
    active.filter((f) => !f.includes('"price"')).forEach((f) => next.append("filter", f));
    const price: Record<string, number> = {};
    if (min) price.min = Number(min);
    if (max) price.max = Number(max);
    if (Object.keys(price).length) next.append("filter", JSON.stringify({ price }));
    push(next);
  };

  const clearAll = () => {
    const next = new URLSearchParams(params);
    next.delete("filter");
    push(next);
  };

  const labelFor = (input: string) => {
    for (const f of filters) for (const v of f.values) if (v.input === input) return v.label;
    try {
      const p = JSON.parse(input).price;
      if (p) return `$${p.min ?? 0} – ${p.max ? `$${p.max}` : "any"}`;
    } catch {
      /* noop */
    }
    return "Filter";
  };

  const listFilters = filters.filter((f) => f.type !== "PRICE_RANGE" && f.values.length);
  const priceFilter = filters.find((f) => f.type === "PRICE_RANGE");

  return (
    <div className={cn("transition-opacity", isPending && "opacity-60")}>
      <div className="flex items-center justify-between gap-4 border-y border-line py-3">
        <div className="flex items-center gap-5">
          {filters.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="label-caps inline-flex items-center gap-2 text-[10.5px] hover:text-accent-ink"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="10" cy="17" r="2" />
              </svg>
              Filter{active.length > 0 && <span className="text-accent-ink">({active.length})</span>}
            </button>
          )}
          <span className="hidden text-[12px] text-muted sm:inline">
            {count} {count === 1 ? "product" : "products"}
          </span>
        </div>

        <label className="relative inline-flex items-center gap-2">
          <span className="label-caps hidden text-[10.5px] text-muted sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value === "featured") next.delete("sort");
              else next.set("sort", e.target.value);
              push(next);
            }}
            className="cursor-pointer appearance-none bg-transparent py-1 pr-6 pl-1 text-[13px] focus:outline-none"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-bg text-fg">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-0 size-4" />
        </label>
      </div>

      {active.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2 pt-4" aria-label="Active filters">
          {active.map((input) => (
            <li key={input}>
              <button
                type="button"
                onClick={() => toggle(input)}
                className="inline-flex items-center gap-2 border border-line bg-bg-soft px-3 py-1.5 text-[12px] hover:border-fg"
                aria-label={`Remove filter ${labelFor(input)}`}
              >
                {labelFor(input)} <CloseIcon className="size-3" />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={clearAll} className="px-2 text-[12px] text-muted underline underline-offset-4 hover:text-fg">
              Clear all
            </button>
          </li>
        </ul>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} side="left" label="Filters">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <h2 className="label-caps">Filter</h2>
            <button type="button" onClick={() => setOpen(false)} className="-mr-2 inline-flex size-10 items-center justify-center" aria-label="Close filters">
              <CloseIcon className="size-5" />
            </button>
          </div>
          <div className="flex-1 divide-y divide-line overflow-y-auto px-6">
            {listFilters.map((f) => (
              <fieldset key={f.id} className="py-6">
                <legend className="label-caps float-left mb-4 w-full text-[10.5px]">{f.label}</legend>
                <ul className="clear-both space-y-3">
                  {f.values.map((v) => {
                    const checked = active.includes(v.input);
                    return (
                      <li key={v.id}>
                        <label className={cn("flex cursor-pointer items-center gap-3 text-[14px]", !v.count && !checked && "opacity-40")}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!v.count && !checked}
                            onChange={() => toggle(v.input)}
                            className="size-4 accent-[var(--accent)]"
                          />
                          <span className="flex-1">{v.label}</span>
                          <span className="text-[12px] text-muted">{v.count}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
            {priceFilter && <PriceFields onApply={setPrice} />}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line p-6">
            <Button variant="outline" onClick={clearAll}>
              Clear
            </Button>
            <Button onClick={() => setOpen(false)}>View {count}</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function PriceFields({ onApply }: { onApply: (min: string, max: string) => void }) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  return (
    <fieldset className="py-6">
      <legend className="label-caps mb-4 text-[10.5px]">Price</legend>
      <div className="flex items-center gap-3">
        <input
          inputMode="numeric"
          value={min}
          onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
          placeholder="$ Min"
          aria-label="Minimum price"
          className="h-11 w-full border border-line bg-surface px-3 text-[13px] focus:border-accent focus:outline-none"
        />
        <span className="text-muted">–</span>
        <input
          inputMode="numeric"
          value={max}
          onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
          placeholder="$ Max"
          aria-label="Maximum price"
          className="h-11 w-full border border-line bg-surface px-3 text-[13px] focus:border-accent focus:outline-none"
        />
      </div>
      <Button size="sm" variant="outline" className="mt-4" onClick={() => onApply(min, max)}>
        Apply price
      </Button>
    </fieldset>
  );
}
