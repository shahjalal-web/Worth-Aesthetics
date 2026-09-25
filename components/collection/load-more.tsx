"use client";

import { useState, useTransition } from "react";
import type { PageInfo, ProductCardData } from "@/lib/shopify/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { loadMoreAction } from "./actions";

export function LoadMore({
  handle,
  sort,
  filters,
  initialPageInfo,
  shown,
}: {
  handle: string;
  sort?: string;
  filters: string[];
  initialPageInfo: PageInfo;
  shown: number;
}) {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [isPending, startTransition] = useTransition();

  const load = () =>
    startTransition(async () => {
      if (!pageInfo.endCursor) return;
      const res = await loadMoreAction({ handle, sort, filters, after: pageInfo.endCursor });
      setProducts((p) => [...p, ...res.products]);
      setPageInfo(res.pageInfo);
    });

  return (
    <>
      {products.map((p) => (
        <li key={p.id} className="animate-fade-up">
          <ProductCard product={p} />
        </li>
      ))}
      {pageInfo.hasNextPage && (
        <li className="col-span-full mt-8 flex flex-col items-center gap-4">
          <p className="text-[12px] text-muted">Showing {shown + products.length} products</p>
          <Button variant="outline" onClick={load} disabled={isPending} aria-busy={isPending}>
            {isPending ? "Loading…" : "Load more"}
          </Button>
        </li>
      )}
    </>
  );
}
