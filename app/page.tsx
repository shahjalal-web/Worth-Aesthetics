import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { BenefitsGrid, BrandStatement, JournalRail, QuizCta, Testimonials } from "@/components/home/more-sections";
import {
  ComingSoonRail,
  EditorialBanner,
  EmailCapture,
  FeaturedSplit,
  IngredientSpotlight,
  ProductRail,
  RitualSteps,
  ScienceBand,
  TrustStrip,
} from "@/components/home/sections";
import { getCollectionProducts, getHeroSlides, getLatestArticles, getProducts, getTestimonials } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Clinical Peptide Skincare` },
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [slides, bestsellersCollection, newCollection, setsCollection, allProducts, testimonials, articles] = await Promise.all([
    getHeroSlides(),
    getCollectionProducts({ handle: "bestsellers", first: 4 }),
    getCollectionProducts({ handle: "new", first: 4 }),
    getCollectionProducts({ handle: "sets", first: 4 }),
    getProducts({ sortKey: "BEST_SELLING", first: 8 }),
    getTestimonials(),
    getLatestArticles(3),
  ]);

  const bestsellers = bestsellersCollection.products.length ? bestsellersCollection.products : allProducts;
  const featured = allProducts.find((p) => /cream/i.test(p.title));

  return (
    <>
      <Hero slide={slides[0]} />
      <TrustStrip />
      <BrandStatement />
      {bestsellers.length ? (
        <ProductRail eyebrow="Most Loved" title="The" accent="bestsellers" products={bestsellers} href="/collections/bestsellers" />
      ) : (
        <ComingSoonRail />
      )}
      <ScienceBand />
      <FeaturedSplit product={featured} />
      <IngredientSpotlight />
      {newCollection.products.length > 0 && (
        <ProductRail eyebrow="Just Arrived" title="New" accent="from the lab" products={newCollection.products} href="/collections/new" />
      )}
      <QuizCta />
      <RitualSteps />
      {setsCollection.products.length > 0 && (
        <ProductRail eyebrow="Sets & Rituals" title="Curated" accent="pairings" products={setsCollection.products} href="/collections/sets" />
      )}
      <Testimonials items={testimonials} />
      <EditorialBanner />
      <JournalRail articles={articles} />
      <BenefitsGrid />
      <EmailCapture />
    </>
  );
}
