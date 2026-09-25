import type { Metadata } from "next";
import Image from "next/image";
import { MolecularDivider, MolecularLattice } from "@/components/brand/molecular";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { fallbackFaq, fallbackIngredients, formulationPrinciples, sciencePillars } from "@/content/site-copy";
import { faqJsonLd, jsonLd } from "@/lib/seo";
import { getFaqItems, getIngredients } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "The Science of Peptides",
  description:
    "How Worth Aesthetics uses signal peptides, copper peptides, NAD+ and PDRN to help skin look firmer, smoother and more radiant.",
  alternates: { canonical: "/pages/science" },
};

export default async function SciencePage() {
  const [ingredients, faq] = await Promise.all([getIngredients(), getFaqItems()]);
  const actives = (ingredients.length ? ingredients : fallbackIngredients).slice(0, 6);
  const scienceFaq = (faq.length ? faq : fallbackFaq).filter((f) => f.category === "Products & Usage").slice(0, 5);

  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="The Science"
        title="Biochemistry,"
        accent="refined"
        intro="Peptides are short chains of amino acids — the same building blocks your skin is made of. We build every formula around them."
        crumbs={[{ label: "Home", href: "/" }, { label: "The Science" }]}
      />

      {/* What are peptides */}
      <section className="py-20 md:py-28">
        <div className="container-wa grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-accent-ink">Peptides, explained</p>
            <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[38px]">
              Small chains, <span className="serif-italic tracking-normal normal-case text-accent-ink">considered results</span>
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                A peptide is a short sequence of amino acids. In skincare, specific sequences are chosen for how they
                interact with the skin&apos;s surface — some act as messengers, others carry trace minerals, and others
                help soften the look of expression lines.
              </p>
              <p>
                Because each peptide has a distinct role, we rarely rely on just one. Our formulas combine multi-peptide
                chains with supporting actives such as NAD+, PDRN and hyaluronic acid.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative lg:col-span-6 lg:col-start-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-[5/4]">
              <Image
                src="/placeholder/nad-pdrn-serum.jpg"
                alt="Worth Aesthetics NAD+ PDRN Serum on marble"
                fill
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="object-cover"
              />
            </div>
            <MolecularLattice className="pointer-events-none absolute -bottom-10 -left-10 hidden w-48 opacity-60 lg:block" />
          </Reveal>
        </div>
      </section>

      {/* Peptide classes */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-wa">
          <Reveal>
            <SectionHeading eyebrow="Three families" title="How peptides" accent="work" />
          </Reveal>
          <ol className="mt-14 grid gap-px bg-line md:grid-cols-3">
            {sciencePillars.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 110} className="bg-surface p-8 md:p-10">
                <span className="font-display text-[11px] tracking-[0.3em] text-accent-ink">{p.n}</span>
                <h3 className="mt-8 text-lg font-light tracking-[0.1em] uppercase">{p.title}</h3>
                <p className="serif-italic mt-1 text-lg text-accent-ink">{p.sub}</p>
                <p className="mt-5 text-[14px] leading-relaxed text-muted">{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Actives */}
      <section className="py-20 md:py-28">
        <div className="container-wa">
          <Reveal>
            <SectionHeading
              eyebrow="Key actives"
              title="Named, measured,"
              accent="purposeful"
              description="The actives at the heart of the Worth Aesthetics collection."
            />
          </Reveal>
          <ul className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {actives.map((ing, i) => (
              <Reveal as="li" key={ing.name} delay={(i % 3) * 90}>
                <p className="text-[40px] leading-none font-extralight tracking-[0.03em]">{ing.name}</p>
                {ing.inci && <p className="serif-italic mt-3 text-lg text-accent-ink">{ing.inci}</p>}
                <MolecularDivider className="my-6 opacity-70" />
                {ing.description && <p className="text-[14px] leading-relaxed text-muted">{ing.description}</p>}
              </Reveal>
            ))}
          </ul>
          <div className="mt-14 flex justify-center">
            <ButtonLink href="/pages/ingredients" variant="outline">
              Full ingredient glossary
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Formulation principles */}
      <section className="relative overflow-hidden bg-charcoal py-20 text-alabaster md:py-28 dark:bg-[#0e0d0c]">
        <MolecularLattice className="pointer-events-none absolute -right-20 -bottom-24 w-[420px] rotate-180 opacity-[0.1]" />
        <div className="container-wa relative grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-taupe">How we formulate</p>
            <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[36px]">
              Our <span className="serif-italic tracking-normal normal-case text-taupe">principles</span>
            </h2>
          </Reveal>
          <ul className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {formulationPrinciples.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 90} className="border-t border-alabaster/20 pt-6">
                <h3 className="label-caps">{p.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-alabaster/70">{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Layering + FAQ */}
      <section className="py-20 md:py-28">
        <div className="container-wa grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-accent-ink">Good to know</p>
            <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[34px]">
              Peptide <span className="serif-italic tracking-normal normal-case text-accent-ink">questions</span>
            </h2>
            <ButtonLink href="/pages/faq" variant="link" className="mt-8 text-[11px]">
              Visit the help centre
            </ButtonLink>
          </Reveal>
          <div className="border-t border-line lg:col-span-7 lg:col-start-6">
            {scienceFaq.map((f) => (
              <AccordionItem key={f.question} title={f.question}>
                <p>{f.answer}</p>
              </AccordionItem>
            ))}
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd(scienceFaq))} />
      </section>

      <section className="border-t border-line bg-bg-soft py-20 text-center md:py-24">
        <Reveal className="container-wa">
          <p className="serif-italic text-3xl md:text-4xl">Find the formula for you</p>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-muted">Answer four questions and we&apos;ll build your ritual.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/pages/routine">Build your routine</ButtonLink>
            <ButtonLink href="/collections/shop-all" variant="outline">
              Shop all
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
