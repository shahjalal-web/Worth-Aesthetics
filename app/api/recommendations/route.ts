import type { NextRequest } from "next/server";
import { z } from "zod";
import { getBagRecommendations } from "@/lib/recommendations";

const item = z.object({ id: z.string().startsWith("gid://shopify/Product/"), productType: z.string().max(40).optional() });

/** Cart-aware "Pairs well with" picks for the bag drawer. ?items=[{"id":"gid://…","productType":"Serum"}] */
export async function GET(req: NextRequest) {
  let bag: z.infer<typeof item>[] = [];
  try {
    bag = z.array(item).max(20).parse(JSON.parse(req.nextUrl.searchParams.get("items") || "[]"));
  } catch {
    return Response.json({ items: [] }, { status: 400 });
  }
  const recs = await getBagRecommendations(bag);
  return Response.json(
    { items: recs },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
