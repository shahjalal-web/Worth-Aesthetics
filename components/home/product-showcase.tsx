"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ArrowRightIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { ProductCardData } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export type ShowcaseTab = { id: string; label: string; href: string; products: ProductCardData[] };

/** Tabbed product carousel (Bestsellers / New / Sets …) with arrow + swipe navigation. */
export function ProductShowcase({ tabs }: { tabs: ShowcaseTab[] }) {
  const available = tabs.filter((t) => t.products.length);
  const [active, setActive] = useState(available[0]?.id);
  const [progress, setProgress] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const tab = available.find((t) => t.id === active) ?? available[0];
  if (!tab) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28" aria-labelledby="showcase-title">
      <div className="container-wa">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-accent-ink">The collection</p>
            <h2 id="showcase-title" className="mt-4 text-[28px] leading-tight font-light tracking-[0.08em] uppercase md:text-[38px]">
              Shop the <span className="serif-italic tracking-normal normal-case text-accent-ink">edit</span>
            </h2>
          </div>
          <div role="tablist" aria-label="Product groups" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {available.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === tab.id}
                onClick={() => {
                  setActive(t.id);
                  setProgress(0);
                  track.current?.scrollTo({ left: 0 });
                }}
                className={cn(
                  "h-10 shrink-0 border px-5 font-display text-[10.5px] font-medium tracking-[0.18em] uppercase transition-colors",
                  t.id === tab.id ? "border-btn bg-btn text-btn-fg" : "border-line text-muted hover:border-fg hover:text-fg",
                )}
              >
                {t.label}
                <span className="ml-2">{t.products.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-10 md:mt-12">
          <div role="tabpanel" aria-label={tab.label}>
            <ul
              key={tab.id}
              ref={track}
              onScroll={(e) => {
                const el = e.currentTarget;
                const max = el.scrollWidth - el.clientWidth;
                setProgress(max > 0 ? el.scrollLeft / max : 1);
              }}
              className="animate-fade no-scrollbar -mx-5 flex snap-x scroll-px-5 md:scroll-px-0 snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 md:mx-0 md:gap-6 md:px-0 lg:gap-8"
            >
              {tab.products.map((p, i) => (
                <li key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-6rem)/4)]">
                  <ProductCard product={p} priority={i < 2} />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous products"
            className="absolute top-[34%] -left-5 hidden size-11 -translate-y-1/2 rotate-180 items-center justify-center border border-line bg-bg/95 shadow-(--shadow) backdrop-blur transition-colors hover:border-fg md:flex xl:-left-6"
          >
            <ChevronRightIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next products"
            className="absolute top-[34%] -right-5 hidden size-11 -translate-y-1/2 items-center justify-center border border-line bg-bg/95 shadow-(--shadow) backdrop-blur transition-colors hover:border-fg md:flex xl:-right-6"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="mt-10 flex items-center gap-6">
          <div className="relative h-px flex-1 bg-line" aria-hidden>
            <span
              className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300"
              style={{ width: `${Math.max(progress, 0.08) * 100}%` }}
            />
          </div>
          <Link href={tab.href} className="label-caps group inline-flex shrink-0 items-center gap-2 text-[10.5px] hover:text-accent-ink">
            View all {tab.label}
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
