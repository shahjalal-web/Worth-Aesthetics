import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { BenefitsGrid, BrandStatement, JournalRail, QuizCta, Testimonials } from "@/components/home/more-sections";
import {
  ComingSoonRail,
  EditorialBanner,
  EmailCapture,
  FeaturedSplit,
  IngredientSpotlight,
  RitualSteps,
  ScienceBand,
  TrustStrip,
} from "@/components/home/sections";
import { ProductShowcase, type ShowcaseTab } from "@/components/home/product-showcase";
import { OurStory, ShopByConcern } from "@/components/home/story-sections";
import { getCollectionProducts, getHeroSlides, getLatestArticles, getProducts, getTestimonials } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Clinical Peptide Skincare` },
  alternates: { canonical: "/" },
};

const CONCERNS = [
  { handle: "anti-wrinkle", label: "Fine lines", hint: "Soften expression lines" },
  { handle: "firming", label: "Firmness", hint: "Lift & resilience" },
  { handle: "texture", label: "Texture", hint: "Smooth & refine" },
  { handle: "radiance", label: "Radiance", hint: "Luminous, even tone" },
  { handle: "hydration", label: "Hydration", hint: "Supple & comfortable" },
];

export default async function HomePage() {
  const [slides, bestsellersCollection, newCollection, setsCollection, allProducts, testimonials, articles, concernCollections] =
    await Promise.all([
      getHeroSlides(),
      getCollectionProducts({ handle: "bestsellers", first: 12 }),
      getCollectionProducts({ handle: "new", first: 12 }),
      getCollectionProducts({ handle: "sets", first: 12 }),
      getProducts({ sortKey: "BEST_SELLING", first: 12 }),
      getTestimonials(),
      getLatestArticles(3),
      Promise.all(CONCERNS.map((c) => getCollectionProducts({ handle: c.handle, first: 12 }))),
    ]);

  // One distinct, single-product image per concern tile (sets look alike, so skip them).
  const usedImages = new Set<string>();
  const concernTiles = CONCERNS.map((c, i) => {
    const products = concernCollections[i].products;
    const pick =
      products.find((p) => p.productType !== "Set" && p.featuredImage && !usedImages.has(p.featuredImage.url)) ?? products[0];
    if (pick?.featuredImage) usedImages.add(pick.featuredImage.url);
    return { ...c, image: pick?.featuredImage ?? null, count: products.length };
  });

  const bestsellers = bestsellersCollection.products.length ? bestsellersCollection.products : allProducts;
  const featured = allProducts.find((p) => p.handle === "ghk-cu-snap-8-firming-cream") ?? allProducts.find((p) => /cream/i.test(p.title));
  const tabs: ShowcaseTab[] = [
    { id: "bestsellers", label: "Bestsellers", href: "/collections/bestsellers", products: bestsellers },
    { id: "new", label: "New", href: "/collections/new", products: newCollection.products },
    { id: "sets", label: "Sets", href: "/collections/sets", products: setsCollection.products },
    { id: "all", label: "Shop all", href: "/collections/shop-all", products: allProducts },
  ];

  return (
    <>
      <Hero slide={slides[0]} />
      <TrustStrip />
      <BrandStatement />
      {allProducts.length ? <ProductShowcase tabs={tabs} /> : <ComingSoonRail />}
      <ShopByConcern tiles={concernTiles} />
      <ScienceBand />
      <FeaturedSplit product={featured} />
      <OurStory />
      <IngredientSpotlight />
      <QuizCta />
      <RitualSteps />
      <Testimonials items={testimonials} />
      <EditorialBanner />
      <JournalRail articles={articles} />
      <BenefitsGrid />
      <EmailCapture />
    </>
  );
}
