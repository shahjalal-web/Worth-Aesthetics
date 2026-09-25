import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MolecularLattice } from "@/components/brand/molecular";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-wider text-muted uppercase">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Editorial page header: text-only (centred) or split with an image. */
export function PageHero({
  eyebrow,
  title,
  accent,
  intro,
  image,
  imageAlt = "",
  crumbs,
  children,
  tone = "soft",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  intro?: ReactNode;
  image?: string;
  imageAlt?: string;
  crumbs?: { label: string; href?: string }[];
  children?: ReactNode;
  tone?: "soft" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        dark ? "border-transparent bg-charcoal text-alabaster dark:bg-[#0e0d0c]" : "border-line bg-bg-soft",
      )}
    >
      <MolecularLattice
        className={cn(
          "pointer-events-none absolute -top-16 -right-12 w-80 md:w-[28rem]",
          dark ? "opacity-[0.14]" : "opacity-40",
        )}
      />
      <div
        className={cn(
          "container-wa relative grid items-center gap-10 py-14 md:py-20",
          image ? "lg:grid-cols-2 lg:gap-16" : "text-center",
        )}
      >
        <div className={cn(!image && "mx-auto max-w-3xl")}>
          {crumbs && (
            <div className={cn("mb-8", !image && "flex justify-center", dark && "[&_*]:text-alabaster/60 [&_[aria-current]]:text-alabaster")}>
              <Breadcrumbs items={crumbs} />
            </div>
          )}
          {eyebrow && <p className={cn("eyebrow animate-fade-up", dark ? "text-taupe" : "text-accent-ink")}>{eyebrow}</p>}
          <h1
            className="animate-fade-up mt-5 text-[34px] leading-[1.1] font-light tracking-[0.06em] uppercase md:text-[52px]"
            style={{ animationDelay: "80ms" }}
          >
            {title}
            {accent && (
              <span
                className={cn(
                  "serif-italic block pt-1 tracking-normal normal-case",
                  dark ? "text-taupe" : "text-accent-ink",
                )}
              >
                {accent}
              </span>
            )}
          </h1>
          {intro && (
            <div
              className={cn(
                "animate-fade-up mt-6 text-[15px] leading-relaxed md:text-base",
                dark ? "text-alabaster/70" : "text-muted",
                !image && "mx-auto max-w-xl",
              )}
              style={{ animationDelay: "160ms" }}
            >
              {intro}
            </div>
          )}
          {children}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden bg-surface lg:aspect-[5/4]">
            <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 1024px) 48vw, 92vw" className="animate-slow-zoom object-cover" />
            <div className="pointer-events-none absolute inset-4 border border-white/40" aria-hidden />
          </div>
        )}
      </div>
    </section>
  );
}
