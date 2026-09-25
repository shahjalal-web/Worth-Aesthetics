"use server";

import { z } from "zod";
import { getCollectionProducts } from "@/lib/shopify";
import { parseFilters, resolveSort } from "@/lib/collection-params";

/** "Load more" pagination for collection grids. */
export async function loadMoreAction(input: {
  handle: string;
  sort?: string;
  filters?: string[];
  after: string;
}) {
  const parsed = z
    .object({
      handle: z.string().regex(/^[a-z0-9-]+$/),
      sort: z.string().optional(),
      filters: z.array(z.string().max(500)).max(20).optional(),
      after: z.string().max(500),
    })
    .safeParse(input);
  if (!parsed.success) return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };

  const sort = resolveSort(parsed.data.sort);
  const { products, pageInfo } = await getCollectionProducts({
    handle: parsed.data.handle,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    filters: parseFilters(parsed.data.filters),
    after: parsed.data.after,
  });
  return { products, pageInfo };
}
