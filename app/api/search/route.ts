import type { NextRequest } from "next/server";
import { predictiveSearch } from "@/lib/shopify";

/** Predictive search for the header overlay (uncached — changes per keystroke). */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (!q) return Response.json({ queries: [], products: [], collections: [] });
  try {
    const result = await predictiveSearch(q);
    return Response.json({
      queries: result.queries,
      collections: result.collections,
      products: result.products.slice(0, 6).map((p) => ({
        handle: p.handle,
        title: p.title,
        subline: p.meta.activeComplex ?? p.meta.subtitle,
        image: p.featuredImage?.url ?? null,
        price: p.priceRange.minVariantPrice,
      })),
    });
  } catch {
    return Response.json({ queries: [], products: [], collections: [] }, { status: 200 });
  }
}
