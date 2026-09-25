import Image from "next/image";
import type { Image as ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** next/image wrapper with a branded placeholder when Shopify has no image. */
export function ProductImage({
  image,
  alt,
  sizes,
  priority,
  className,
}: {
  image: ShopifyImage | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!image) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-surface text-accent",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <svg viewBox="0 0 48 48" className="size-10 opacity-60" fill="none" aria-hidden>
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="16" cy="20" r="1.5" fill="currentColor" />
          <circle cx="30" cy="16" r="1.5" fill="currentColor" />
          <circle cx="26" cy="31" r="1.5" fill="currentColor" />
          <path d="M16 20 30 16 26 31Z" stroke="currentColor" strokeWidth="0.6" />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={image.url}
      alt={image.altText || alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
