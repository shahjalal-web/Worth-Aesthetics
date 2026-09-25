"use client";

import Link from "next/link";
import { Suspense, use, useState } from "react";
import type { Cart, CartLine, ProductCardData } from "@/lib/shopify/types";
import { DEFAULT_OPTION } from "@/lib/shopify/constants";
import { cn, formatMoney } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { CloseIcon, LockIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity";
import { Sheet } from "@/components/ui/sheet";
import { PaymentBadges, TrustRow } from "@/components/ui/trust-row";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { useCart, useCartActions } from "./cart-context";
import { FreeShippingBar } from "./free-shipping-bar";

export function CartDrawer({ upsellPromise }: { upsellPromise: Promise<ProductCardData[]> }) {
  const { isOpen, close } = useCartActions();
  return (
    <Sheet open={isOpen} onClose={close} side="right" label="Shopping bag">
      <Suspense fallback={<DrawerSkeleton onClose={close} />}>
        <DrawerContent upsellPromise={upsellPromise} />
      </Suspense>
    </Sheet>
  );
}

function DrawerHeader({ count, onClose }: { count?: number; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-6 py-5">
      <h2 className="label-caps">
        Your Bag{typeof count === "number" && count > 0 && <span className="ml-2 text-muted">({count})</span>}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="-mr-2 inline-flex size-10 items-center justify-center hover:text-accent-ink"
        aria-label="Close bag"
      >
        <CloseIcon className="size-5" />
      </button>
    </div>
  );
}

function DrawerSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <DrawerHeader onClose={onClose} />
      <div className="space-y-4 p-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-28 w-22 animate-pulse bg-surface" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-3/4 animate-pulse bg-surface" />
              <div className="h-3 w-1/3 animate-pulse bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrawerContent({ upsellPromise }: { upsellPromise: Promise<ProductCardData[]> }) {
  const { cart, close, error, isPending } = useCart();
  const hasItems = cart.lines.length > 0;

  return (
    <div className="flex h-full flex-col">
      <DrawerHeader count={cart.totalQuantity} onClose={close} />

      {hasItems ? (
        <>
          <div className="border-b border-line bg-bg-soft px-6 py-5">
            <FreeShippingBar subtotal={cart.cost.subtotalAmount} />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-line px-6">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>
            <Upsell upsellPromise={upsellPromise} cart={cart} />
            <NoteField initial={cart.note ?? ""} />
          </div>

          <div className="border-t border-line bg-bg px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {error && (
              <p role="alert" className="mb-3 text-[13px] text-accent-ink">
                {error}
              </p>
            )}
            <div className="flex items-baseline justify-between">
              <span className="label-caps">Subtotal</span>
              <span className="text-lg tabular-nums">{formatMoney(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Shipping &amp; taxes calculated at checkout. Discount codes can be applied at checkout.
            </p>
            <a
              href={cart.checkoutUrl || "#"}
              aria-disabled={!cart.checkoutUrl || isPending}
              className={buttonClasses({
                size: "lg",
                className: cn("mt-4 w-full", (!cart.checkoutUrl || isPending) && "pointer-events-none opacity-60"),
              })}
            >
              <LockIcon className="size-4" />
              {isPending ? "Updating…" : "Secure Checkout"}
            </a>
            <PaymentBadges className="mt-3" />
            <TrustRow compact className="mt-5 border-t border-line pt-4" />
          </div>
        </>
      ) : (
        <EmptyBag upsellPromise={upsellPromise} onClose={close} />
      )}
    </div>
  );
}

function CartLineItem({ line }: { line: CartLine }) {
  const { updateQuantity, close } = useCartActions();
  const { merchandise } = line;
  const optimistic = line.id.startsWith("optimistic:");
  const variantLabel = merchandise.title !== DEFAULT_OPTION ? merchandise.title : null;
  const href = `/products/${merchandise.product.handle}`;

  return (
    <li className={cn("flex gap-4 py-5 transition-opacity", optimistic && "opacity-70")}>
      <Link
        href={href}
        onClick={close}
        className="relative aspect-[4/5] w-22 shrink-0 overflow-hidden bg-surface"
        tabIndex={-1}
        aria-hidden
      >
        <ProductImage
          image={merchandise.image ?? merchandise.product.featuredImage}
          alt={merchandise.product.title}
          sizes="88px"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} onClick={close} className="title-caps text-[13px] leading-snug hover:text-accent-ink">
            {merchandise.product.title}
          </Link>
          <span className="shrink-0 text-[13px] tabular-nums">{formatMoney(line.cost.totalAmount)}</span>
        </div>
        {variantLabel && <p className="mt-1 text-[12px] text-muted">{variantLabel}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => updateQuantity(line.id, q)}
            min={1}
            disabled={optimistic}
            label={`Quantity for ${merchandise.product.title}`}
          />
          <button
            type="button"
            onClick={() => updateQuantity(line.id, 0)}
            disabled={optimistic}
            className="text-[11px] tracking-wider text-muted underline underline-offset-4 hover:text-fg disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function Upsell({ upsellPromise, cart }: { upsellPromise: Promise<ProductCardData[]>; cart: Cart }) {
  const products = use(upsellPromise);
  const { addItem } = useCartActions();
  const inCart = new Set(cart.lines.map((l) => l.merchandise.product.handle));
  const picks = products.filter((p) => !inCart.has(p.handle) && p.availableForSale).slice(0, 3);
  if (!picks.length) return null;

  return (
    <section className="border-t border-line px-6 py-6" aria-labelledby="upsell-title">
      <h3 id="upsell-title" className="serif-italic text-lg">
        Pairs well with
      </h3>
      <ul className="mt-4 space-y-4">
        {picks.map((p) => {
          const variant = p.variants.find((v) => v.availableForSale) ?? p.variants[0];
          return (
            <li key={p.id} className="flex items-center gap-4">
              <div className="relative aspect-square w-16 shrink-0 overflow-hidden bg-surface">
                <ProductImage image={p.featuredImage} alt={p.title} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="title-caps truncate text-[12px]">{p.title}</p>
                <Price price={variant.price} compareAt={variant.compareAtPrice} className="text-[12px] text-muted" />
              </div>
              <button
                type="button"
                onClick={() => addItem(p, variant)}
                className="shrink-0 border border-line px-3 py-2 font-display text-[10px] font-medium tracking-[0.15em] uppercase hover:border-fg"
                aria-label={`Add ${p.title} to bag`}
              >
                Add
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function NoteField({ initial }: { initial: string }) {
  const { saveNote } = useCartActions();
  const [open, setOpen] = useState(Boolean(initial));
  const [value, setValue] = useState(initial);

  return (
    <div className="border-t border-line px-6 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-[12px] tracking-wide text-muted hover:text-fg"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>Add a gift note</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => value !== initial && saveNote(value)}
          maxLength={500}
          rows={3}
          aria-label="Gift note"
          placeholder="Your message — we'll include it with the order."
          className="mt-3 w-full resize-none border border-line bg-surface p-3 text-[13px] placeholder:text-muted focus:border-accent focus:outline-none"
        />
      )}
    </div>
  );
}

function EmptyBag({
  upsellPromise,
  onClose,
}: {
  upsellPromise: Promise<ProductCardData[]>;
  onClose: () => void;
}) {
  const products = use(upsellPromise).slice(0, 2);
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-10">
      <div className="text-center">
        <p className="serif-italic text-3xl">Your bag is empty</p>
        <p className="mt-3 text-[13px] text-muted">
          Discover peptide formulas crafted for visibly firmer, smoother-looking skin.
        </p>
        <Link href="/collections/shop-all" onClick={onClose} className={buttonClasses({ className: "mt-7" })}>
          Shop the collection
        </Link>
      </div>
      {products.length > 0 && (
        <div className="mt-12">
          <p className="eyebrow text-center text-muted">Most loved</p>
          <ul className="mt-5 grid grid-cols-2 gap-4">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.handle}`} onClick={onClose} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                    <ProductImage
                      image={p.featuredImage}
                      alt={p.title}
                      sizes="180px"
                      className="transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="title-caps mt-3 text-[11px] leading-snug">{p.title}</p>
                  <Price price={p.priceRange.minVariantPrice} className="mt-1 text-[12px] text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
