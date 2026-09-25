"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Money } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/utils";

const KEY = "wa-recently-viewed";
const MAX = 8;

type Item = {
  handle: string;
  title: string;
  image: string | null;
  price: Money;
  subline: string | null;
};

function read(): Item[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Records a product view (mounted on the PDP). */
export function TrackRecentlyViewed({ item }: { item: Item }) {
  useEffect(() => {
    try {
      const next = [item, ...read().filter((i) => i.handle !== item.handle)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, [item]);
  return null;
}

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // Hydrate from storage after mount (not available during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(read().filter((i) => i.handle !== exclude));
  }, [exclude]);

  if (!items.length) return null;

  return (
    <section className="border-t border-line py-16 md:py-20" aria-labelledby="recently-viewed">
      <div className="container-wa">
        <h2 id="recently-viewed" className="text-center">
          <span className="eyebrow text-accent-ink">Recently viewed</span>
        </h2>
        <ul className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-2 md:justify-center">
          {items.map((i) => (
            <li key={i.handle} className="w-36 shrink-0 md:w-44">
              <Link href={`/products/${i.handle}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  {i.image && (
                    <Image
                      src={i.image}
                      alt={i.title}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <p className="title-caps mt-3 text-[11px] leading-snug">{i.title}</p>
                <p className="mt-1 text-[12px] text-muted">{formatMoney(i.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
