import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
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
import { getCollectionProducts, getHeroSlides, getProducts } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Clinical Peptide Skincare` },
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [slides, bestsellersCollection, allProducts] = await Promise.all([
    getHeroSlides(),
    getCollectionProducts({ handle: "bestsellers", first: 4 }),
    getProducts({ sortKey: "BEST_SELLING", first: 8 }),
  ]);

  const bestsellers = bestsellersCollection.products.length
    ? bestsellersCollection.products
    : allProducts;
  const featured = allProducts.find((p) => /cream/i.test(p.title));

  return (
    <>
      <Hero slide={slides[0]} />
      <TrustStrip />
      {bestsellers.length ? (
        <ProductRail
          eyebrow="Most Loved"
          title="The"
          accent="bestsellers"
          products={bestsellers}
          href="/collections/bestsellers"
        />
      ) : (
        <ComingSoonRail />
      )}
      <ScienceBand />
      <FeaturedSplit product={featured} />
      <IngredientSpotlight />
      <RitualSteps />
      <EditorialBanner />
      <EmailCapture />
    </>
  );
}
