import Image from "next/image";
import Link from "next/link";
import { MolecularLattice } from "@/components/brand/molecular";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses } from "@/components/ui/button";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

export type ConcernTile = { handle: string; label: string; hint: string; image: ShopifyImage | null; count: number };

/** "Shop by concern" tiles — each links to its smart collection; image = first product in it. */
export function ShopByConcern({ tiles }: { tiles: ConcernTile[] }) {
  const shown = tiles.filter((t) => t.count > 0);
  if (!shown.length) return null;
  return (
    <section className="bg-bg-soft py-20 md:py-28" aria-labelledby="concern-title">
      <div className="container-wa">
        <Reveal className="text-center">
          <p className="eyebrow text-accent-ink">Shop by concern</p>
          <h2 id="concern-title" className="mt-4 text-[28px] leading-tight font-light tracking-[0.08em] uppercase md:text-[38px]">
            What does your skin <span className="serif-italic tracking-normal normal-case text-accent-ink">ask for?</span>
          </h2>
        </Reveal>
        <ul className="no-scrollbar -mx-5 mt-12 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-5 md:gap-5 md:px-0">
          {shown.map((t, i) => (
            <Reveal as="li" key={t.handle} delay={i * 70} className="w-[58vw] shrink-0 snap-start sm:w-[36vw] md:w-auto">
              <Link href={`/collections/${t.handle}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  {t.image && (
                    <Image
                      src={t.image.url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 19vw, 58vw"
                      className="object-cover transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.05]"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[#2d2b2a]/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[15px] font-light tracking-[0.1em] uppercase">{t.label}</p>
                    <p className="mt-1 text-[12px] text-white/80">{t.hint}</p>
                  </div>
                </div>
                <p className="mt-3 flex items-center justify-between text-[12px] text-muted">
                  {t.count} {t.count === 1 ? "formula" : "formulas"}
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-ink" />
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Brand story split — mirrors the reference site's family/heritage block. Copy is brand voice, not factual claims. */
export function OurStory() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <MolecularLattice className="pointer-events-none absolute -bottom-10 -left-16 w-96 opacity-25" />
      <div className="container-wa relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <div className="relative grid grid-cols-5 gap-4">
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden bg-surface">
              <Image src="/placeholder/snap8-serum.jpg" alt="Worth Aesthetics Snap-8 + GHK-Cu Face Serum" fill sizes="(min-width: 1024px) 28vw, 60vw" className="object-cover" />
            </div>
            <div className="col-span-2 flex flex-col gap-4 pt-16">
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                <Image src="/placeholder/black-jar.jpg" alt="" fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
              </div>
              <p className="serif-italic text-[15px] leading-snug text-muted">Formulated with intention, finished with care.</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-5 lg:col-start-8">
          <p className="eyebrow text-accent-ink">Our story</p>
          <h2 className="mt-4 text-[28px] leading-tight font-light tracking-[0.08em] uppercase md:text-[38px]">
            Where the clinic <span className="serif-italic tracking-normal normal-case text-accent-ink">meets the maison</span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            Worth Aesthetics began with a simple conviction: that the precision of peptide science and the calm of true luxury
            belong together. Every formula is built around a considered multi-peptide complex, housed in packaging you&apos;ll
            want to keep.
          </p>
          <ul className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 text-center">
            {[
              ["Peptide-led", "every formula"],
              ["Considered", "ingredient lists"],
              ["US", "shipping"],
            ].map(([a, b]) => (
              <li key={a}>
                <p className="serif-italic text-[22px] text-accent-ink">{a}</p>
                <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">{b}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/pages/about" className={buttonClasses()}>
              Read our story
            </Link>
            <Link href="/pages/science" className={buttonClasses({ variant: "outline" })}>
              The science
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
