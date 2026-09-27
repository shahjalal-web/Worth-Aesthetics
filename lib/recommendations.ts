import "server-only";
import { getCollectionProducts, getProductRecommendations, getProducts } from "@/lib/shopify";
import type { ProductCardData } from "@/lib/shopify/types";

export type Recommendation = { product: ProductCardData; reason: string };

/** Core ritual steps — if the bag is missing one, we surface it first. */
const RITUAL_STEPS = ["Cleanser", "Serum", "Cream"] as const;

/**
 * "Pairs well with" for the cart drawer. Ranking, highest first:
 *  1. COMPLEMENTARY pairings the client set in Shopify Search & Discovery (+4)
 *  2. Fills a missing ritual step — e.g. serum in bag but no cream (+3)
 *  3. RELATED products from Shopify's recommendation engine (+2, decays by rank)
 *  4. Bestsellers as a fallback (+1)
 * Products already in the bag and sold-out items are never shown.
 */
export async function getBagRecommendations(
  bag: { id: string; productType?: string }[],
  limit = 4,
): Promise<Recommendation[]> {
  const inBag = new Set(bag.map((b) => b.id));
  const bagTypes = new Set(bag.map((b) => b.productType).filter(Boolean));
  const missingSteps = RITUAL_STEPS.filter((t) => !bagTypes.has(t));
  const sources = bag.slice(0, 3);

  const [complementary, related, bestsellers] = await Promise.all([
    Promise.all(sources.map((b) => getProductRecommendations(b.id, "COMPLEMENTARY").catch(() => []))),
    Promise.all(sources.map((b) => getProductRecommendations(b.id, "RELATED").catch(() => []))),
    getCollectionProducts({ handle: "bestsellers", first: 12 })
      .then((r) => (r.products.length ? r.products : getProducts({ sortKey: "BEST_SELLING", first: 12 })))
      .catch(() => [] as ProductCardData[]),
  ]);

  const pool = new Map<string, { product: ProductCardData; score: number; reason: string }>();
  const consider = (product: ProductCardData, score: number, reason: string) => {
    if (inBag.has(product.id) || !product.availableForSale) return;
    const current = pool.get(product.id);
    if (!current) pool.set(product.id, { product, score, reason });
    else if (score > 0) {
      current.score += score;
      if (score >= 2 && current.reason === "Most loved") current.reason = reason;
    }
  };

  complementary.flat().forEach((p) => consider(p, 4, "Perfect pairing"));
  related.flat().forEach((p, i) => consider(p, Math.max(2 - i * 0.15, 0.5), "Pairs beautifully"));
  bestsellers.forEach((p, i) => consider(p, Math.max(1 - i * 0.05, 0.3), "Most loved"));

  // Only the strongest candidate per missing step gets the boost, so picks stay varied.
  const boosted = new Set<string>();
  for (const entry of [...pool.values()].sort((a, b) => b.score - a.score)) {
    const type = entry.product.productType as (typeof RITUAL_STEPS)[number];
    if (bag.length && missingSteps.includes(type) && !boosted.has(type)) {
      boosted.add(type);
      entry.score += 3;
      entry.reason = `Next step · ${type === "Cleanser" ? "Cleanse" : type === "Serum" ? "Treat" : "Seal"}`;
    }
    // Bundles and accessories are rarely the best add-on to an existing bag.
    if (entry.product.productType === "Set" && bag.length) entry.score -= 1.5;
    if (entry.product.productType === "Accessory") entry.score -= 0.5;
  }

  return [...pool.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, reason }) => ({ product, reason }));
}
