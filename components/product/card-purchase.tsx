"use client";

import { useState } from "react";
import { useCartActions } from "@/components/cart/cart-context";
import { DEFAULT_OPTION } from "@/lib/shopify/constants";
import type { ProductCardData } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { Price } from "./price";

/** Size/variant pills + one-tap "Add to bag" on product cards. */
export function CardPurchase({ product }: { product: ProductCardData }) {
  const { addItem } = useCartActions();
  const variants = product.variants;
  const hasChoices = variants.length > 1 && variants[0]?.title !== DEFAULT_OPTION;
  const [selectedId, setSelectedId] = useState(
    (variants.find((v) => v.availableForSale) ?? variants[0])?.id,
  );
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return null;

  return (
    <div className="mt-auto flex flex-col items-center">
      {!hasChoices && product.meta.sizeLabel && (
        <p className="mt-2 font-display text-[9.5px] font-medium tracking-[0.18em] text-muted uppercase">
          {product.meta.sizeLabel}
        </p>
      )}
      {hasChoices && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Size">
          {variants.slice(0, 4).map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={v.id === selected.id}
              disabled={!v.availableForSale}
              onClick={() => setSelectedId(v.id)}
              className={cn(
                "min-w-11 border px-2.5 py-1 text-[10.5px] tracking-wider transition-colors",
                v.id === selected.id ? "border-fg text-fg" : "border-line text-muted hover:border-fg/50",
                !v.availableForSale && "line-through opacity-40",
              )}
            >
              {v.title}
            </button>
          ))}
        </div>
      )}
      <Price price={selected.price} compareAt={selected.compareAtPrice} className="mt-3 text-[14px]" />
      <button
        type="button"
        disabled={!selected.availableForSale}
        onClick={() => addItem(product, selected)}
        className={cn(
          "mt-4 h-11 w-full border border-fg/85 font-display text-[10.5px] font-medium tracking-[0.2em] uppercase",
          "transition-colors duration-300 hover:bg-fg hover:text-bg",
          "disabled:border-line disabled:text-muted disabled:hover:bg-transparent",
          "md:opacity-90 md:group-hover:bg-fg md:group-hover:text-bg md:group-hover:opacity-100",
        )}
        aria-label={`Add ${product.title}${hasChoices ? ` (${selected.title})` : ""} to bag`}
      >
        {selected.availableForSale ? "Add to bag" : "Sold out"}
      </button>
    </div>
  );
}
