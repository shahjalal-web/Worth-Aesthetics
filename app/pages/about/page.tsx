import type { Metadata } from "next";
import Image from "next/image";
import { MolecularDivider } from "@/components/brand/molecular";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { aboutPrinciples } from "@/content/site-copy";
import { getPage } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Worth Aesthetics — the union of clinical peptide biochemistry and understated luxury design.",
  alternates: { canonical: "/pages/about" },
};

export default async function AboutPage() {
  // Founder story is edited in Shopify → Online Store → Pages → "about".
  const page = await getPage("about");

  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Skincare worth"
        accent="the ritual"
        intro="Worth Aesthetics represents the union of clinical peptide biochemistry and understated luxury design."
        image="/placeholder/leather-pouch.jpg"
        imageAlt="Worth Aesthetics leather pouch on a travertine plinth"
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
      />

      <section className="py-20 md:py-28">
        <Reveal className="container-wa max-w-3xl text-center">
          <MolecularDivider className="mx-auto mb-10 max-w-xs" />
          {page?.body ? (
            <div className="wa-prose text-left md:text-[17px]" dangerouslySetInnerHTML={{ __html: page.body }} />
          ) : (
            <p className="text-[22px] leading-[1.6] font-light md:text-[28px]">
              We believe advanced skincare should feel as considered as it performs —{" "}
              <span className="serif-italic text-accent-ink">precise in its science, quiet in its luxury.</span>
            </p>
          )}
        </Reveal>
      </section>

      <section className="bg-surface py-20 md:py-28">
        <div className="container-wa">
          <ul className="grid gap-px bg-line md:grid-cols-3">
            {aboutPrinciples.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 110} className="bg-surface p-8 md:p-12">
                <span className="serif-italic text-4xl text-accent-ink">{["I", "II", "III"][i]}</span>
                <h2 className="label-caps mt-6">{p.title}</h2>
                <p className="mt-4 text-[14px] leading-relaxed text-muted">{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-wa grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative aspect-square overflow-hidden bg-surface">
            <Image
              src="/placeholder/black-jar.jpg"
              alt="Worth Aesthetics treatment jar with its application spatula"
              fill
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow text-accent-ink">Every touchpoint</p>
            <h2 className="mt-5 text-[28px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[38px]">
              Crafted to be <span className="serif-italic tracking-normal normal-case text-accent-ink">kept</span>
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>
                Heavy-base, acid-etched frosted glass with a silky hand-feel. Brushed champagne-toned collars.
                Soft-touch cartons that feel velvety in the hand.
              </p>
              <p>
                Our treatment jars are sealed hermetically and paired with a dedicated spatula, so every application stays
                as pristine as the first.
              </p>
            </div>
            <ButtonLink href="/pages/science" variant="outline" className="mt-10">
              Discover the science
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-band py-20 text-center text-band-fg md:py-24">
        <Reveal className="container-wa">
          <p className="eyebrow text-band-accent">The collection</p>
          <p className="serif-italic mt-5 text-3xl md:text-4xl">Begin your ritual</p>
          <div className="mt-9 flex justify-center">
            <ButtonLink href="/collections/shop-all" variant="accent">
              Shop all
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
