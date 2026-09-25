import Link from "next/link";
import type { ProductCardData } from "@/lib/shopify/types";
import { cn, savingsPercent } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { CardPurchase } from "./card-purchase";

export function ProductBadge({ product }: { product: ProductCardData }) {
  const variant = product.variants[0];
  const save = variant ? savingsPercent(variant.price, variant.compareAtPrice) : 0;
  const label = !product.availableForSale
    ? "Sold out"
    : product.meta.badge || (save >= 5 ? `Save ${save}%` : null);
  if (!label) return null;
  return (
    <span className="absolute top-3 left-3 z-10 bg-bg/95 px-2.5 py-1.5 font-display text-[9.5px] font-medium tracking-[0.18em] text-fg uppercase backdrop-blur-sm">
      {label}
    </span>
  );
}

export function ProductCard({
  product,
  priority,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw",
  className,
}: {
  product: ProductCardData;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const href = `/products/${product.handle}`;
  const [first, second] = product.images;
  const primary = product.featuredImage ?? first;
  const hover = second && second.url !== primary?.url ? second : null;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-surface" aria-label={product.title}>
        <ProductBadge product={product} />
        <ProductImage
          image={primary}
          alt={product.title}
          sizes={sizes}
          priority={priority}
          className={cn(
            "transition-[opacity,transform] duration-700 ease-(--ease-luxe) group-hover:scale-[1.03]",
            hover && "group-hover:opacity-0",
          )}
        />
        {hover && (
          <ProductImage
            image={hover}
            alt=""
            sizes={sizes}
            className="scale-[1.03] opacity-0 transition-[opacity,transform] duration-700 ease-(--ease-luxe) group-hover:scale-100 group-hover:opacity-100"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4 text-center md:pt-5">
        <h3 className="title-caps text-[12px] leading-snug md:text-[13px]">
          <Link href={href} className="transition-colors hover:text-accent-ink">
            {product.title}
          </Link>
        </h3>
        {product.meta.activeComplex && (
          <p className="serif-italic mt-1.5 text-[15px] leading-snug text-muted md:text-base">
            {product.meta.activeComplex}
          </p>
        )}
        {!product.meta.activeComplex && product.meta.subtitle && (
          <p className="mt-1.5 text-[12.5px] text-muted">{product.meta.subtitle}</p>
        )}
        <CardPurchase product={product} />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      <div className="aspect-[4/5] animate-pulse bg-surface" />
      <div className="mx-auto mt-5 h-3 w-3/4 animate-pulse bg-surface" />
      <div className="mx-auto mt-2 h-3 w-1/2 animate-pulse bg-surface" />
      <div className="mt-5 h-11 animate-pulse bg-surface" />
    </div>
  );
}
