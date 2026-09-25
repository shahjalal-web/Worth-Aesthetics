"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Image as ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

export function ProductGallery({ images, title }: { images: ShopifyImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  if (!images.length) {
    return (
      <div className="relative aspect-[4/5] bg-surface">
        <ProductImage image={null} alt={title} sizes="50vw" />
      </div>
    );
  }

  const goTo = (i: number) => {
    setActive(i);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
  };

  return (
    <div className={cn(images.length > 1 && "lg:grid lg:grid-cols-[76px_1fr] lg:gap-5")}>
      {/* Thumbnails (desktop) */}
      {images.length > 1 && (
        <ul className="hidden max-h-[calc(100svh-12rem)] flex-col gap-3 overflow-y-auto lg:flex" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn(
                  "relative block aspect-[4/5] w-full overflow-hidden bg-surface transition-opacity",
                  i === active ? "opacity-100 ring-1 ring-fg ring-offset-2 ring-offset-bg" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="76px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Main: swipe track on mobile, single zoomable frame on desktop */}
      <div className="relative">
        <ul
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          aria-label="Product images"
        >
          {images.map((img, i) => (
            <li key={img.url} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-surface">
              <Image
                src={img.url}
                alt={img.altText || `${title} — image ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>

        <div
          className="relative hidden aspect-[4/5] cursor-zoom-in overflow-hidden bg-surface lg:block"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
        >
          <Image
            key={images[active].url}
            src={images[active].url}
            alt={images[active].altText || title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="animate-fade object-cover transition-transform duration-300 ease-out"
            style={
              zoom
                ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2 lg:hidden" aria-hidden>
            {images.map((img, i) => (
              <span
                key={img.url}
                className={cn("h-px transition-all duration-300", i === active ? "w-8 bg-fg" : "w-4 bg-line-strong")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
