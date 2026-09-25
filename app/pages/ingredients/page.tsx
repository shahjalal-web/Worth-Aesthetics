import type { Metadata } from "next";
import Image from "next/image";
import { MolecularDivider } from "@/components/brand/molecular";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { fallbackIngredients } from "@/content/site-copy";
import { getIngredients } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Ingredient Glossary",
  description: "Every key active in Worth Aesthetics formulas — what it is and why we use it.",
  alternates: { canonical: "/pages/ingredients" },
};

export default async function IngredientsPage() {
  const fromShopify = await getIngredients();
  const ingredients = (fromShopify.length ? fromShopify : fallbackIngredients)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const letters = [...new Set(ingredients.map((i) => i.name[0].toUpperCase()))];

  return (
    <>
      <PageHero
        eyebrow="Glossary"
        title="The ingredient"
        accent="edit"
        intro="Transparency is part of the formula. Here's every key active we use, and why."
        crumbs={[{ label: "Home", href: "/" }, { label: "The Science", href: "/pages/science" }, { label: "Ingredients" }]}
      />

      <nav aria-label="Jump to letter" className="sticky top-16 z-20 border-b border-line bg-bg/95 backdrop-blur md:top-[76px]">
        <ul className="container-wa no-scrollbar flex gap-1 overflow-x-auto py-3">
          {letters.map((l) => (
            <li key={l}>
              <a href={`#letter-${l}`} className="inline-flex size-9 items-center justify-center font-display text-[12px] tracking-wider hover:bg-surface hover:text-accent-ink">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="py-16 md:py-24">
        <ul className="container-wa grid gap-x-10 gap-y-14 md:grid-cols-2">
          {ingredients.map((ing, i) => {
            const first = i === ingredients.findIndex((x) => x.name[0].toUpperCase() === ing.name[0].toUpperCase());
            return (
              <Reveal
                as="li"
                key={ing.name}
                className="scroll-mt-40"
                delay={(i % 2) * 80}
              >
                <div id={first ? `letter-${ing.name[0].toUpperCase()}` : undefined} className="flex gap-6">
                  {ing.image && (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-surface">
                      <Image src={ing.image.url} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-[28px] leading-none font-extralight tracking-[0.03em] md:text-[34px]">{ing.name}</h2>
                    {ing.inci && <p className="serif-italic mt-2 text-lg text-accent-ink">{ing.inci}</p>}
                    <MolecularDivider className="my-5 opacity-70" />
                    {ing.description && <p className="text-[14px] leading-relaxed text-muted">{ing.description}</p>}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
        <p className="container-wa mt-16 text-center text-[12px] text-muted">
          Full INCI lists are shown on every product page.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/collections/shop-all" variant="outline">
            Shop the collection
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
