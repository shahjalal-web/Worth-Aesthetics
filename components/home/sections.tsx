import Image from "next/image";
import Link from "next/link";
import { MolecularDivider, MolecularLattice } from "@/components/brand/molecular";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, LockIcon, MoleculeIcon, SparkIcon, TruckIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsletterForm } from "@/components/layout/newsletter";
import { siteConfig } from "@/lib/site-config";
import type { ProductCardData } from "@/lib/shopify/types";

/* ------------------------------------------------------------------ */
/* Trust strip                                                        */
/* ------------------------------------------------------------------ */
export function TrustStrip() {
  const items = [
    { icon: MoleculeIcon, title: "Peptide-powered", text: "Multi-peptide complexes in every formula" },
    { icon: TruckIcon, title: "Complimentary shipping", text: `On US orders over $${siteConfig.freeShippingThreshold}` },
    { icon: LockIcon, title: "Secure checkout", text: "Shop Pay, Apple Pay, Google Pay & PayPal" },
    { icon: SparkIcon, title: "Considered luxury", text: "Frosted glass & soft-touch cartons" },
  ];
  return (
    <section aria-label="Why Worth Aesthetics" className="border-y border-line bg-bg-soft">
      <ul className="container-wa grid grid-cols-2 gap-y-8 py-9 md:py-10 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className="flex flex-col items-center gap-3 px-3 text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line lg:[&:not(:first-child)]:pl-8"
            data-index={i}
          >
            <Icon className="size-6 shrink-0 text-accent" />
            <div>
              <p className="label-caps text-[10.5px]">{title}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Product rail                                                       */
/* ------------------------------------------------------------------ */
export function ProductRail({
  eyebrow,
  title,
  accent,
  products,
  href,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  products: ProductCardData[];
  href: string;
}) {
  return (
    <section className="py-20 md:py-28">
      <div className="container-wa">
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            accent={accent}
            align="left"
            action={
              <Link href={href} className="label-caps group inline-flex items-center gap-2 text-[10.5px] hover:text-accent-ink">
                View all
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>
        <ul className="no-scrollbar -mx-5 mt-12 flex snap-x scroll-px-5 md:scroll-px-0 snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-8">
          {products.slice(0, 4).map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 80} className="w-[68vw] shrink-0 snap-start sm:w-[44vw] md:w-auto">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Shown only while the Shopify catalog is empty. Teases the known line-up
 * (CLAUDE.md §4) without prices or purchase buttons.
 */
export function ComingSoonRail() {
  const items = [
    { title: "Snap-8 + GHK-Cu Face Serum", sub: "Acetyl Octapeptide-3 + Copper Tripeptide-1", size: "30 ML / 1.0 FL. OZ.", image: "/placeholder/snap8-serum.jpg", fit: "contain" },
    { title: "NAD+ PDRN Serum", sub: "NAD+ · PDRN Complex", size: "50 ML / 1.75 FL. OZ.", image: "/placeholder/nad-pdrn-serum.jpg", fit: "cover" },
    { title: "GHK-Cu Snap-8 Firming Cream", sub: "Copper Tripeptide-1 + Hyaluronic Acid", size: "50 G", image: "/placeholder/firming-cream.jpg", fit: "crop-bottom" },
    { title: "The Signature Pouch", sub: "Soft leather travel companion", size: "Accessory", image: "/placeholder/leather-pouch.jpg", fit: "cover" },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-wa">
        <Reveal>
          <SectionHeading
            eyebrow="The Collection"
            title="Formulas of"
            accent="quiet precision"
            description="Our debut collection arrives shortly. Join the Worth Letter for first access."
          />
        </Reveal>
        <ul className="no-scrollbar -mx-5 mt-14 flex snap-x scroll-px-5 md:scroll-px-0 snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-8">
          {items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80} className="group w-[68vw] shrink-0 snap-start sm:w-[44vw] md:w-auto">
              <div className={item.fit === "contain" ? "relative aspect-[4/5] overflow-hidden bg-white" : "relative aspect-[4/5] overflow-hidden bg-surface"}>
                <span className="absolute top-3 left-3 z-10 bg-bg/95 px-2.5 py-1.5 font-display text-[9.5px] font-medium tracking-[0.18em] uppercase">
                  Coming soon
                </span>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 68vw"
                  className={
                    item.fit === "contain"
                      ? "object-contain p-8 transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.03]"
                      : item.fit === "crop-bottom"
                        ? "origin-bottom scale-[1.32] object-cover object-bottom transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.36]"
                        : "object-cover transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.03]"
                  }
                />
              </div>
              <div className="pt-5 text-center">
                <h3 className="title-caps text-[12px] leading-snug md:text-[13px]">{item.title}</h3>
                <p className="serif-italic mt-1.5 text-[15px] text-muted md:text-base">{item.sub}</p>
                <p className="mt-2 font-display text-[9.5px] font-medium tracking-[0.18em] text-muted uppercase">
                  {item.size}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The Science band                                                   */
/* ------------------------------------------------------------------ */
export function ScienceBand() {
  const pillars = [
    {
      n: "01",
      title: "Signal Peptides",
      sub: "Acetyl Octapeptide-3 (Snap-8)",
      text: "Short amino-acid chains that help soften the look of expression lines for a smoother, more relaxed-looking surface.",
    },
    {
      n: "02",
      title: "Copper Peptides",
      sub: "Copper Tripeptide-1 (GHK-Cu)",
      text: "A copper-bound tripeptide celebrated for supporting the look of firmer, more resilient skin.",
    },
    {
      n: "03",
      title: "Cellular Energy",
      sub: "NAD+ · PDRN",
      text: "Paired to help skin look revitalized, bouncier and luminous — day after day.",
    },
  ];
  return (
    <section className="relative overflow-hidden bg-band py-24 text-band-fg md:py-32">
      <MolecularLattice className="pointer-events-none absolute top-10 -left-24 w-[520px] opacity-[0.14]" />
      <MolecularLattice className="pointer-events-none absolute -right-20 -bottom-24 w-[420px] rotate-180 opacity-[0.1]" />
      <div className="container-wa relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-band-accent">The Science</p>
          <h2 className="mt-5 text-[28px] leading-[1.2] font-light tracking-[0.06em] uppercase md:text-[40px]">
            Biochemistry, <span className="serif-italic tracking-normal normal-case text-band-accent">refined</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-band-muted">
            Every Worth Aesthetics formula is built around multi-peptide chains and biomimetic
            complexes — chosen for how they help skin look, and feel, its most composed.
          </p>
        </Reveal>

        <ol className="mt-16 grid gap-px bg-band-line md:mt-20 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 120} className="bg-band p-8 md:p-10">
              <span className="font-display text-[11px] tracking-[0.3em] text-band-accent">{p.n}</span>
              <h3 className="mt-8 text-lg font-light tracking-[0.1em] uppercase">{p.title}</h3>
              <p className="serif-italic mt-1 text-lg text-band-accent">{p.sub}</p>
              <p className="mt-5 text-[14px] leading-relaxed text-band-muted">{p.text}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-14 flex justify-center">
          <Link
            href="/pages/science"
            className="label-caps group inline-flex items-center gap-3 border border-band-fg/40 px-8 py-4 text-[10.5px] transition-colors hover:border-btn hover:bg-btn hover:text-btn-fg"
          >
            Explore our peptides
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured product (split editorial)                                 */
/* ------------------------------------------------------------------ */
export function FeaturedSplit({ product }: { product?: ProductCardData }) {
  const href = product ? `/products/${product.handle}` : "/collections/creams-moisturizers";
  return (
    <section className="py-20 md:py-28">
      <div className="container-wa grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative lg:col-span-6">
          <div className="relative aspect-square overflow-hidden bg-surface">
            <Image
              src={product?.featuredImage?.url ?? "/placeholder/black-jar.jpg"}
              alt={product?.featuredImage?.altText ?? "Worth Aesthetics treatment jar with application spatula"}
              fill
              sizes="(min-width: 1024px) 48vw, 92vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-3 -bottom-3 -z-10 hidden size-full border border-accent/50 lg:block" aria-hidden />
        </Reveal>
        <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
          <p className="eyebrow text-accent-ink">The Treatment Ritual</p>
          <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[38px]">
            {product?.title ?? "A cream worth"}{" "}
            {!product && <span className="serif-italic tracking-normal normal-case text-accent-ink">the ritual</span>}
          </h2>
          {product?.meta.activeComplex && (
            <p className="serif-italic mt-3 text-xl text-muted">{product.meta.activeComplex}</p>
          )}
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            Double-walled frosted glass, a hermetic seal and a dedicated spatula keep every
            application pristine — because luxury, done properly, is also hygienic.
          </p>
          <ul className="mt-8 space-y-3 border-t border-line pt-8 text-[14px]">
            {[
              "Rich, cushioning texture that melts into skin",
              "Helps skin look firmer and smoother",
              "Spatula application — no fingertips in the jar",
            ].map((b) => (
              <li key={b} className="flex gap-4">
                <span className="mt-2.5 h-px w-5 shrink-0 bg-accent" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <ButtonLink href={href} className="mt-10">
            {product ? "Shop now" : "Explore creams"}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ingredient spotlight                                               */
/* ------------------------------------------------------------------ */
export function IngredientSpotlight() {
  const ingredients = [
    { name: "Snap-8", inci: "Acetyl Octapeptide-3", text: "An eight-amino-acid peptide that helps the look of expression lines appear softened." },
    { name: "GHK-Cu", inci: "Copper Tripeptide-1", text: "A copper peptide that supports the appearance of firm, resilient, even-toned skin." },
    { name: "NAD+", inci: "Nicotinamide Adenine Dinucleotide", text: "A coenzyme included to help skin look energized and revitalized." },
    { name: "PDRN", inci: "Polydeoxyribonucleotide", text: "A skincare favourite for a smoother, bouncier-looking complexion." },
  ];
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="container-wa">
        <Reveal>
          <SectionHeading
            eyebrow="Key Actives"
            title="The"
            accent="ingredient edit"
            description="Named, measured and purposeful — the actives at the heart of our formulas."
          />
        </Reveal>
        <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {ingredients.map((ing, i) => (
            <Reveal as="li" key={ing.name} delay={i * 90} className="group relative bg-surface p-8 transition-colors duration-500 hover:bg-bg md:p-10">
              <p className="text-[40px] leading-none font-extralight tracking-[0.04em] md:text-5xl">{ing.name}</p>
              <p className="serif-italic mt-3 text-[17px] text-accent-ink">{ing.inci}</p>
              <MolecularDivider className="my-6 opacity-70" />
              <p className="text-[14px] leading-relaxed text-muted">{ing.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ritual (AM/PM routine)                                             */
/* ------------------------------------------------------------------ */
export function RitualSteps() {
  const steps = [
    { n: "I", title: "Cleanse", text: "Begin on freshly cleansed, towel-dried skin." },
    { n: "II", title: "Serum", text: "Press 3–5 drops into face and neck until absorbed." },
    { n: "III", title: "Treat", text: "Seal with a spatula-measured layer of cream." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-wa grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="eyebrow text-accent-ink">Your Ritual</p>
          <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[36px]">
            Three steps, <span className="serif-italic tracking-normal normal-case text-accent-ink">morning &amp; evening</span>
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">
            Designed to layer seamlessly — lightweight serums first, richer treatment last.
          </p>
          <ButtonLink href="/collections/sets" variant="outline" className="mt-9">
            Shop the sets
          </ButtonLink>
        </Reveal>
        <ol className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6 lg:gap-8">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 120} className="border-t border-line-strong pt-7">
              <span className="serif-italic text-4xl text-accent-ink">{s.n}</span>
              <h3 className="label-caps mt-5">{s.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial (pouch)                                                  */
/* ------------------------------------------------------------------ */
export function EditorialBanner() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-square lg:aspect-auto lg:min-h-[640px]">
          <Image
            src="/placeholder/leather-pouch.jpg"
            alt="Worth Aesthetics leather pouch on a travertine plinth"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center bg-bg-soft px-6 py-16 md:px-16 lg:px-20">
          <Reveal className="max-w-md">
            <p className="eyebrow text-accent-ink">Considered Details</p>
            <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[38px]">
              Travel in <span className="serif-italic tracking-normal normal-case text-accent-ink">quiet luxury</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-muted">
              A soft, supple pouch embossed with the WA monogram — made to carry your ritual from
              home to hotel suite.
            </p>
            <ButtonLink href="/collections/accessories" variant="outline" className="mt-10">
              Discover accessories
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Email capture                                                      */
/* ------------------------------------------------------------------ */
export function EmailCapture() {
  return (
    <section id="newsletter" className="scroll-mt-24 py-20 md:py-28">
      <Reveal className="container-wa">
        <div className="mx-auto max-w-2xl text-center">
          <MolecularDivider className="mx-auto mb-10 max-w-xs" />
          <p className="eyebrow text-accent-ink">The Worth Letter</p>
          <h2 className="mt-5 text-[26px] leading-[1.2] font-light tracking-[0.06em] uppercase md:text-[34px]">
            First access, <span className="serif-italic tracking-normal normal-case text-accent-ink">always</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Be first to know about launches, rituals and private offers.
          </p>
          <div className="mx-auto mt-9 max-w-md text-left">
            <NewsletterForm tone="light" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
