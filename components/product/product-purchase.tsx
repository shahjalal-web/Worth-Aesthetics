"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCartActions } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";
import { DEFAULT_OPTION } from "@/lib/shopify/constants";
import type { Product } from "@/lib/shopify/types";
import { cn, savingsPercent } from "@/lib/utils";
import { Price } from "./price";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCartActions();
  const hasOptions = !(product.options.length === 1 && product.options[0].values[0] === DEFAULT_OPTION);
  const firstAvailable = product.variants.find((v) => v.availableForSale) ?? product.variants[0];

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(firstAvailable?.selectedOptions.map((o) => [o.name, o.value]) ?? []),
  );
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const variant = useMemo(
    () =>
      product.variants.find((v) => v.selectedOptions.every((o) => selection[o.name] === o.value)) ??
      firstAvailable,
    [product.variants, selection, firstAvailable],
  );

  // Sticky add-to-bag bar on mobile once the main button scrolls out of view.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!variant) return null;

  const available = variant.availableForSale;
  const save = savingsPercent(variant.price, variant.compareAtPrice);
  const isAvailable = (optionName: string, value: string) =>
    product.variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) => (o.name === optionName ? o.value === value : selection[o.name] === o.value)),
    );

  const add = () => addItem(product, variant, qty);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Price price={variant.price} compareAt={variant.compareAtPrice} className="text-xl" />
        {save >= 5 && (
          <span className="bg-surface px-2 py-1 font-display text-[9.5px] font-medium tracking-[0.18em] uppercase">
            Save {save}%
          </span>
        )}
      </div>

      {hasOptions &&
        product.options.map((option) => (
          <fieldset key={option.id} className="mt-8">
            <legend className="label-caps mb-3 text-[10.5px]">
              {option.name}: <span className="font-sans font-light tracking-normal normal-case text-muted">{selection[option.name]}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const selected = selection[option.name] === value;
                const ok = isAvailable(option.name, value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelection((s) => ({ ...s, [option.name]: value }))}
                    className={cn(
                      "min-w-16 border px-4 py-2.5 text-[13px] transition-colors",
                      selected ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
                      !ok && "text-muted line-through decoration-1",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

      <div ref={buttonRef} className="mt-8 flex gap-3">
        <QuantityStepper value={qty} onChange={setQty} size="md" max={10} disabled={!available} />
        <Button size="lg" className="flex-1" onClick={add} disabled={!available}>
          {available ? "Add to bag" : "Sold out"}
        </Button>
      </div>

      {/* Sticky mobile bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 ease-(--ease-luxe) lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="title-caps truncate text-[11px]">{product.title}</p>
            <Price price={variant.price} compareAt={variant.compareAtPrice} className="text-[13px]" />
          </div>
          <Button onClick={add} disabled={!available} tabIndex={showSticky ? 0 : -1}>
            {available ? "Add to bag" : "Sold out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
