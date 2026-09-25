"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import type { Money } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/utils";

type Result = {
  queries: string[];
  collections: { handle: string; title: string }[];
  products: { handle: string; title: string; subline: string | null; image: string | null; price: Money }[];
};

const POPULAR = ["Serum", "Peptide", "GHK-Cu", "Firming cream", "NAD+"];
const QUICK_LINKS = [
  { label: "Bestsellers", href: "/collections/bestsellers" },
  { label: "Build your routine", href: "/pages/routine" },
  { label: "The Science", href: "/pages/science" },
];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setResult((await res.json()) as Result);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const hasTerm = q.trim().length > 0;
  const shown = hasTerm ? result : null;

  return (
    <dialog
      ref={ref}
      aria-label="Search"
      className="wa-search m-0 h-auto max-h-[92dvh] w-full max-w-none overflow-y-auto bg-bg p-0 text-fg backdrop:bg-(--overlay) backdrop:backdrop-blur-[2px]"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="container-wa py-6 md:py-10">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
          className="flex items-center gap-4 border-b border-fg/70 focus-within:border-accent"
        >
          <SearchIcon className="size-5 shrink-0 text-muted" />
          <label htmlFor="overlay-q" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="overlay-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search serums, peptides, ingredients…"
            autoComplete="off"
            className="h-16 flex-1 bg-transparent text-lg font-light outline-none placeholder:text-muted md:text-2xl"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="inline-flex size-10 items-center justify-center hover:text-accent-ink">
            <CloseIcon className="size-5" />
          </button>
        </form>

        <div className="grid gap-10 py-8 md:grid-cols-12 md:py-10" aria-live="polite">
          <div className="md:col-span-4">
            <p className="eyebrow text-muted">{shown?.queries.length ? "Suggestions" : "Popular searches"}</p>
            <ul className="mt-4 flex flex-wrap gap-2 md:flex-col md:gap-3">
              {(shown?.queries.length ? shown.queries : POPULAR).map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => setQ(s)} className="border border-line px-3 py-1.5 text-[13px] hover:border-fg md:border-0 md:p-0 md:text-[15px] md:hover:text-accent-ink">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-10 text-muted">{shown?.collections.length ? "Collections" : "Explore"}</p>
            <ul className="mt-4 space-y-3">
              {(shown?.collections.length ? shown.collections.map((c) => ({ label: c.title, href: `/collections/${c.handle}` })) : QUICK_LINKS).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={onClose} className="group inline-flex items-center gap-2 text-[15px] hover:text-accent-ink">
                    {l.label}
                    <ArrowRightIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-8">
            <p className="eyebrow text-muted">{hasTerm ? (loading ? "Searching…" : "Products") : "Start typing to search"}</p>
            {hasTerm && shown && !shown.products.length && !loading && (
              <p className="mt-6 text-[14px] text-muted">No products match “{q.trim()}”.</p>
            )}
            {shown && shown.products.length > 0 && (
              <>
                <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {shown.products.map((p) => (
                    <li key={p.handle}>
                      <Link href={`/products/${p.handle}`} onClick={onClose} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                          {p.image && <Image src={p.image} alt={p.title} fill sizes="200px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}
                        </div>
                        <p className="title-caps mt-3 text-[11px] leading-snug">{p.title}</p>
                        {p.subline && <p className="serif-italic text-[14px] text-muted">{p.subline}</p>}
                        <p className="mt-1 text-[12px]">{formatMoney(p.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)} className="label-caps mt-8 inline-flex items-center gap-2 text-[10.5px] underline decoration-accent underline-offset-[6px]">
                  View all results <ArrowRightIcon className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
