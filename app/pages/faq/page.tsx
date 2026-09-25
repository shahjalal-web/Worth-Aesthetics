import type { Metadata } from "next";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { fallbackFaq } from "@/content/site-copy";
import { faqJsonLd, jsonLd } from "@/lib/seo";
import { getFaqItems } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Answers about orders, shipping, returns and using Worth Aesthetics peptide skincare.",
  alternates: { canonical: "/pages/faq" },
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function FaqPage() {
  const fromShopify = await getFaqItems();
  const faq = fromShopify.length ? fromShopify : fallbackFaq;
  const groups = new Map<string, typeof faq>();
  for (const item of faq) {
    const key = item.category || "General";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd(faq))} />
      <PageHero
        eyebrow="Help centre"
        title="How can we"
        accent="help?"
        intro="Everything you need to know about orders, delivery and your ritual."
        crumbs={[{ label: "Home", href: "/" }, { label: "Help & FAQ" }]}
      />

      <section className="py-16 md:py-24">
        <div className="container-wa grid gap-12 lg:grid-cols-12">
          <nav aria-label="FAQ topics" className="lg:col-span-3">
            <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:sticky lg:top-32 lg:flex-col lg:gap-1">
              {[...groups.keys()].map((g) => (
                <li key={g} className="shrink-0">
                  <a
                    href={`#${slug(g)}`}
                    className="block border border-line px-4 py-2 text-[13px] hover:border-fg lg:border-0 lg:border-l lg:px-5 lg:py-2.5 lg:hover:border-accent lg:hover:text-accent-ink"
                  >
                    {g}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-16 lg:col-span-8 lg:col-start-5">
            {[...groups.entries()].map(([group, items]) => (
              <section key={group} id={slug(group)} className="scroll-mt-32" aria-labelledby={`h-${slug(group)}`}>
                <h2 id={`h-${slug(group)}`} className="label-caps text-accent-ink">
                  {group}
                </h2>
                <div className="mt-4 border-t border-line">
                  {items.map((f) => (
                    <AccordionItem key={f.question} title={f.question}>
                      <p>{f.answer}</p>
                    </AccordionItem>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-bg-soft py-16 text-center md:py-20">
        <div className="container-wa">
          <p className="serif-italic text-3xl">Still have a question?</p>
          <p className="mt-3 text-[15px] text-muted">Our team is happy to help.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/pages/contact">Contact us</ButtonLink>
            <ButtonLink href="/policies/refund-policy" variant="outline">
              Returns policy
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
