"use client";

import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import type { Cart, CartLine, ProductCardData } from "@/lib/shopify/types";
import { DEFAULT_OPTION } from "@/lib/shopify/constants";
import { cn, formatMoney } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { CloseIcon, LockIcon, PlusIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/quantity";
import { Sheet } from "@/components/ui/sheet";
import { PaymentBadges, TrustRow } from "@/components/ui/trust-row";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/product/price";
import { idFromGid, track } from "@/lib/analytics/client";
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
    <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
      <h2 className="font-display text-[11px] font-medium tracking-[0.2em] uppercase">
        Your Bag{typeof count === "number" && count > 0 && <span className="ml-1.5 text-muted">({count})</span>}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="-mr-2 inline-flex size-9 items-center justify-center hover:text-accent-ink"
        aria-label="Close bag"
      >
        <CloseIcon className="size-[18px]" />
      </button>
    </div>
  );
}

function DrawerSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <DrawerHeader onClose={onClose} />
      <div className="space-y-4 p-5">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-3.5">
            <div className="h-[90px] w-[72px] animate-pulse bg-surface" />
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
          <div className="border-b border-line bg-bg-soft px-5 py-3">
            <FreeShippingBar subtotal={cart.cost.subtotalAmount} compact />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-line px-5">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>
            <Upsell upsellPromise={upsellPromise} cart={cart} />
            <NoteField initial={cart.note ?? ""} />
            <TrustRow compact className="border-t border-line px-5 py-4" />
          </div>

          <div className="border-t border-line bg-bg px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-[0_-12px_24px_-18px_rgb(0_0_0/0.12)]">
            {error && (
              <p role="alert" className="mb-2 text-[12px] text-accent-ink">
                {error}
              </p>
            )}
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[11px] font-medium tracking-[0.18em] uppercase">Subtotal</span>
              <span className="text-[16px] tabular-nums">{formatMoney(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted">Shipping, taxes &amp; discount codes at checkout.</p>
            <a
              href={cart.checkoutUrl || "#"}
              aria-disabled={!cart.checkoutUrl || isPending}
              onClick={() =>
                track("begin_checkout", {
                  currency: cart.cost.subtotalAmount.currencyCode,
                  value: parseFloat(cart.cost.subtotalAmount.amount),
                  items: cart.lines.map((l) => ({
                    item_id: idFromGid(l.merchandise.product.id),
                    item_name: l.merchandise.product.title,
                    item_variant: l.merchandise.title,
                    price: parseFloat(l.cost.totalAmount.amount) / l.quantity,
                    quantity: l.quantity,
                  })),
                })
              }
              className={buttonClasses({
                className: cn("mt-3 h-12 w-full text-[11px]", (!cart.checkoutUrl || isPending) && "pointer-events-none opacity-60"),
              })}
            >
              <LockIcon className="size-3.5" />
              {isPending ? "Updating…" : "Secure Checkout"}
            </a>
            <PaymentBadges className="mt-2.5" compact />
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
    <li className={cn("flex gap-3.5 py-4 transition-opacity", optimistic && "opacity-70")}>
      <Link
        href={href}
        onClick={close}
        className="relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden bg-surface"
        tabIndex={-1}
        aria-hidden
      >
        <ProductImage
          image={merchandise.image ?? merchandise.product.featuredImage}
          alt={merchandise.product.title}
          sizes="72px"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} onClick={close} className="title-caps line-clamp-2 text-[11.5px] leading-snug hover:text-accent-ink">
            {merchandise.product.title}
          </Link>
          <span className="shrink-0 text-[12.5px] tabular-nums">{formatMoney(line.cost.totalAmount)}</span>
        </div>
        {variantLabel && <p className="mt-0.5 text-[11px] text-muted">{variantLabel}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => updateQuantity(line.id, q)}
            min={1}
            size="xs"
            disabled={optimistic}
            label={`Quantity for ${merchandise.product.title}`}
          />
          <button
            type="button"
            onClick={() => updateQuantity(line.id, 0)}
            disabled={optimistic}
            className="text-[10.5px] tracking-wider text-muted underline underline-offset-4 hover:text-fg disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

type Rec = { product: ProductCardData; reason: string };

/** Cart-aware picks from /api/recommendations (see lib/recommendations.ts); bestsellers until they load. */
function Upsell({ upsellPromise, cart }: { upsellPromise: Promise<ProductCardData[]>; cart: Cart }) {
  const fallback = use(upsellPromise);
  const { addItem } = useCartActions();
  const key = JSON.stringify(
    cart.lines
      .filter((l) => !l.id.startsWith("optimistic:"))
      .map((l) => ({ id: l.merchandise.product.id, productType: l.merchandise.product.productType })),
  );
  const [fetched, setFetched] = useState<{ key: string; items: Rec[] } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/recommendations?items=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: Rec[] }) => {
        if (alive) setFetched({ key, items: d.items });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);

  const inCart = new Set(cart.lines.map((l) => l.merchandise.product.handle));
  const source: Rec[] = fetched?.items.length ? fetched.items : fallback.map((product) => ({ product, reason: "Most loved" }));
  const recs = source.filter((r) => !inCart.has(r.product.handle) && r.product.availableForSale).slice(0, 4);
  if (!recs.length) return null;

  return (
    <section className="border-t border-line py-5" aria-labelledby="upsell-title">
      <h3 id="upsell-title" className="serif-italic px-5 text-[17px]">
        Pairs well with
      </h3>
      <ul className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
        {recs.map(({ product: p, reason }) => {
          const variant = p.variants.find((v) => v.availableForSale) ?? p.variants[0];
          return (
            <li key={p.id} className="flex w-[136px] shrink-0 snap-start flex-col">
              <Link href={`/products/${p.handle}`} className="relative block aspect-square overflow-hidden bg-surface">
                <ProductImage image={p.featuredImage} alt={p.title} sizes="136px" />
              </Link>
              <p className="mt-2 truncate font-display text-[8.5px] tracking-[0.16em] text-accent-ink uppercase">{reason}</p>
              <p className="title-caps mt-1 line-clamp-2 min-h-[2.6em] text-[10.5px] leading-[1.3]">{p.title}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <Price price={variant.price} compareAt={variant.compareAtPrice} className="text-[11.5px]" />
                <button
                  type="button"
                  onClick={() => addItem(p, variant)}
                  className="inline-flex size-7 shrink-0 items-center justify-center border border-line transition-colors hover:border-btn hover:bg-btn hover:text-btn-fg"
                  aria-label={`Add ${p.title} to bag`}
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
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
    <div className="border-t border-line px-5 py-3">
      <button
        type="button"
        className="flex w-full items-center justify-between text-[11.5px] tracking-wide text-muted hover:text-fg"
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
          rows={2}
          aria-label="Gift note"
          placeholder="Your message — we'll include it with the order."
          className="mt-2.5 w-full resize-none border border-line bg-surface p-3 text-[12.5px] placeholder:text-muted focus:border-accent focus:outline-none"
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
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-10">
      <div className="text-center">
        <p className="serif-italic text-[26px]">Your bag is empty</p>
        <p className="mt-2 text-[12.5px] text-muted">
          Discover peptide formulas crafted for visibly firmer, smoother-looking skin.
        </p>
        <Link href="/collections/shop-all" onClick={onClose} className={buttonClasses({ size: "sm", className: "mt-6" })}>
          Shop the collection
        </Link>
      </div>
      {products.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow text-center text-muted">Most loved</p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
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
                  <p className="title-caps mt-2.5 line-clamp-2 text-[10.5px] leading-snug">{p.title}</p>
                  <Price price={p.priceRange.minVariantPrice} className="mt-1 text-[11.5px] text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
