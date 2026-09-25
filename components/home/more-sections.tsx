import Link from "next/link";
import { ArticleCard } from "@/components/blog/article-card";
import { MolecularDivider, MolecularLattice } from "@/components/brand/molecular";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ArticleCard as ArticleCardData, Testimonial } from "@/lib/shopify/types";
import { siteConfig } from "@/lib/site-config";

/* ------------------------------------------------------------------ */
/* Brand statement                                                    */
/* ------------------------------------------------------------------ */
export function BrandStatement() {
  return (
    <section className="py-20 md:py-28">
      <Reveal className="container-wa max-w-4xl text-center">
        <MolecularDivider className="mx-auto mb-10 max-w-[200px]" />
        <p className="text-[24px] leading-[1.5] font-light tracking-[0.02em] md:text-[34px]">
          Where clinical peptide biochemistry meets <span className="serif-italic text-accent-ink">understated luxury</span> —
          formulas you can trust, rituals you will look forward to.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Routine quiz CTA                                                   */
/* ------------------------------------------------------------------ */
export function QuizCta() {
  return (
    <section className="relative overflow-hidden bg-bg-soft py-20 md:py-28">
      <MolecularLattice className="pointer-events-none absolute top-1/2 -left-24 w-[420px] -translate-y-1/2 opacity-40" />
      <div className="container-wa relative grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <p className="eyebrow text-accent-ink">Build your routine</p>
          <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[40px]">
            Not sure where <span className="serif-italic tracking-normal normal-case text-accent-ink">to begin?</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            Three questions about your skin, and we&apos;ll curate a peptide ritual — in the right order, morning and
            evening.
          </p>
          <ButtonLink href="/pages/routine" size="lg" className="mt-10">
            Take the quiz
          </ButtonLink>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
          <ol className="space-y-px bg-line">
            {["Your primary concern", "Your skin type", "How many steps you enjoy"].map((q, i) => (
              <li key={q} className="flex items-center gap-6 bg-bg-soft py-6">
                <span className="serif-italic w-10 text-3xl text-accent-ink">{["I", "II", "III"][i]}</span>
                <span className="label-caps text-[11px]">{q}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials — Shopify `testimonial` metaobjects only, never invented */
/* ------------------------------------------------------------------ */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="py-20 md:py-28" aria-labelledby="testimonials">
      <div className="container-wa">
        <Reveal>
          <SectionHeading eyebrow="In their words" title="Kind" accent="words" />
        </Reveal>
        <ul className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:px-0">
          {items.slice(0, 6).map((t, i) => (
            <Reveal as="li" key={t.id} delay={i * 90} className="w-[80vw] shrink-0 snap-start border border-line bg-bg p-8 md:w-auto">
              <p className="serif-italic text-5xl leading-none text-accent" aria-hidden>
                &ldquo;
              </p>
              <blockquote className="mt-2 text-[16px] leading-relaxed">{t.quote}</blockquote>
              <p className="label-caps mt-6 text-[10px] text-muted">— {t.author}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Journal rail                                                       */
/* ------------------------------------------------------------------ */
export function JournalRail({ articles }: { articles: ArticleCardData[] }) {
  if (!articles.length) return null;
  return (
    <section className="border-t border-line py-20 md:py-28">
      <div className="container-wa">
        <Reveal>
          <SectionHeading
            eyebrow="The Journal"
            title="Notes on"
            accent="skin & science"
            align="left"
            action={
              <Link
                href={`/blogs/${siteConfig.journalHandle}`}
                className="label-caps group inline-flex items-center gap-2 text-[10.5px] hover:text-accent-ink"
              >
                Read the journal
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>
        <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal as="li" key={a.id} delay={i * 90}>
              <ArticleCard article={a} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benefits grid                                                      */
/* ------------------------------------------------------------------ */
export function BenefitsGrid() {
  const items = [
    {
      title: "Complimentary shipping",
      text: `On every US order over $${siteConfig.freeShippingThreshold}.`,
      href: "/pages/faq#orders-shipping",
      cta: "Shipping details",
    },
    { title: "Secure checkout", text: "Shop Pay, Apple Pay, Google Pay & PayPal — hosted by Shopify.", href: "/pages/faq", cta: "Payment options" },
    { title: "Your ritual, curated", text: "Three questions to your personalised peptide routine.", href: "/pages/routine", cta: "Take the quiz" },
    { title: "The Worth Letter", text: "First access to launches, rituals and private offers.", href: "#newsletter", cta: "Join now" },
  ];
  return (
    <section className="bg-surface py-16 md:py-20">
      <ul className="container-wa grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b, i) => (
          <Reveal as="li" key={b.title} delay={i * 80} className="flex flex-col bg-surface p-8">
            <h3 className="label-caps text-[11px]">{b.title}</h3>
            <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted">{b.text}</p>
            <Link href={b.href} className="mt-5 text-[12px] underline decoration-accent underline-offset-4 hover:text-accent-ink">
              {b.cta}
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
