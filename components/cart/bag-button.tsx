"use client";

import { Suspense } from "react";
import { BagIcon } from "@/components/ui/icons";
import { useCart, useCartActions } from "./cart-context";

function Count() {
  const { cart } = useCart();
  if (!cart.totalQuantity) return null;
  return (
    <span className="absolute top-1 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] leading-4 font-medium text-charcoal tabular-nums">
      {cart.totalQuantity}
    </span>
  );
}

export function BagButton() {
  const { open } = useCartActions();
  return (
    <button
      type="button"
      onClick={open}
      className="relative inline-flex size-10 items-center justify-center text-fg transition-colors hover:text-accent-ink"
      aria-label="Open shopping bag"
    >
      <BagIcon className="size-[20px]" />
      <Suspense fallback={null}>
        <Count />
      </Suspense>
    </button>
  );
}
