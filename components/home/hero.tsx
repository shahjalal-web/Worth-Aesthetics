import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { MolecularLattice } from "@/components/brand/molecular";
import type { HeroSlide } from "@/lib/shopify/types";

/**
 * Product-led hero. Content comes from the first `hero_slide` metaobject in
 * Shopify; the fallback below is used until the client creates one.
 */
export function Hero({ slide }: { slide?: HeroSlide }) {
  const eyebrow = slide?.eyebrow ?? "Clinical Peptide Skincare";
  const headline = slide?.headline ?? "Precision peptides for visibly firmer skin";
  const subline =
    slide?.subline ??
    "Biomimetic peptide complexes, copper tripeptide and NAD+ — formulated with clinical precision and finished with understated luxury.";
  const cta = { label: slide?.ctaLabel ?? "Shop the Collection", href: slide?.ctaLink ?? "/collections/shop-all" };
  const image = slide?.image?.url ?? "/placeholder/nad-pdrn-serum.jpg";
  const alt = slide?.image?.altText ?? "Worth Aesthetics NAD+ PDRN Serum with its carton on marble";

  // Split the headline so the final words can carry the serif-italic accent.
  const words = headline.split(" ");
  const accentCount = Math.min(2, Math.max(1, Math.floor(words.length / 3)));
  const lead = words.slice(0, -accentCount).join(" ");
  const accent = words.slice(-accentCount).join(" ");

  return (
    <section className="relative overflow-hidden bg-bg">
      <div className="container-wa grid items-center gap-8 pt-4 pb-14 sm:gap-10 md:py-14 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-12 lg:gap-6 lg:py-0">
        {/* Copy */}
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-5 lg:py-20">
          <p className="eyebrow animate-fade-up text-accent-ink">{eyebrow}</p>
          <h1
            className="animate-fade-up mt-6 text-[38px] leading-[1.05] font-light tracking-[0.04em] uppercase sm:text-5xl lg:text-[58px] xl:text-[66px]"
            style={{ animationDelay: "80ms" }}
          >
            {lead}{" "}
            <span className="serif-italic block pt-1 text-[1.08em] tracking-normal normal-case text-accent-ink">
              {accent}
            </span>
          </h1>
          <p
            className="animate-fade-up mt-7 max-w-md text-[15px] leading-relaxed text-muted md:text-base"
            style={{ animationDelay: "160ms" }}
          >
            {subline}
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: "240ms" }}>
            <ButtonLink href={cta.href} size="lg">
              {cta.label}
            </ButtonLink>
            <ButtonLink href="/pages/science" variant="link" className="text-[11px]">
              Discover the Science
            </ButtonLink>
          </div>
          <dl
            className="animate-fade-up mt-14 grid max-w-md grid-cols-3 border-t border-line pt-6"
            style={{ animationDelay: "320ms" }}
          >
            {[
              ["Peptide", "complexes"],
              ["Frosted", "glass vessels"],
              ["Shopify", "secure checkout"],
            ].map(([a, b]) => (
              <div key={a} className="pr-3">
                <dt className="serif-italic text-xl text-fg">{a}</dt>
                <dd className="mt-1 text-[11px] tracking-wide text-muted uppercase">{b}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px] sm:aspect-[4/5] overflow-hidden bg-surface lg:max-h-[calc(100svh-10rem)]">
            <Image
              src={image}
              alt={alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="animate-slow-zoom object-cover"
            />
            <div className="pointer-events-none absolute inset-4 border border-white/40" aria-hidden />
          </div>
          <MolecularLattice className="pointer-events-none absolute -bottom-10 -left-10 hidden w-56 opacity-50 lg:block" />
          {!slide && (
            <div className="absolute right-3 bottom-6 hidden bg-bg/95 sm:block px-5 py-4 shadow-(--shadow) backdrop-blur md:-right-2 lg:right-auto lg:-left-10">
              <p className="eyebrow text-accent-ink">Featured</p>
              <p className="title-caps mt-2 text-[13px]">NAD+ PDRN Serum</p>
              <p className="serif-italic text-[15px] text-muted">NAD+ · PDRN Complex</p>
              <p className="mt-1 font-display text-[9.5px] tracking-[0.18em] text-muted uppercase">50 ML / 1.75 FL. OZ.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
