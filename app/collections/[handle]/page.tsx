import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadMore } from "@/components/collection/load-more";
import { CollectionToolbar } from "@/components/collection/toolbar";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ButtonLink } from "@/components/ui/button";
import { MolecularLattice } from "@/components/brand/molecular";
import { parseFilters, resolveSort } from "@/lib/collection-params";
import { getCollection, getCollectionProducts, getCollections, getProducts } from "@/lib/shopify";
import type { Collection } from "@/lib/shopify/types";

const PAGE_SIZE = 24;

/** Handles that should still render (with an "all products" fallback) before they exist in Shopify. */
const VIRTUAL: Record<string, { title: string; description: string }> = {
  "shop-all": {
    title: "Shop All",
    description: "The complete Worth Aesthetics collection — peptide serums, treatment creams and rituals.",
  },
};

export async function generateStaticParams() {
  const collections = await getCollections();
  const handles = new Set([...collections.map((c) => c.handle), ...Object.keys(VIRTUAL)]);
  return [...handles].map((handle) => ({ handle }));
}

async function resolveCollection(handle: string): Promise<Collection | undefined> {
  const collection = await getCollection(handle);
  if (collection) return collection;
  const v = VIRTUAL[handle];
  if (!v) return undefined;
  return {
    id: handle,
    handle,
    title: v.title,
    description: v.description,
    descriptionHtml: "",
    image: null,
    seo: { title: null, description: null },
    updatedAt: "",
  };
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const collection = await resolveCollection(handle);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description || undefined,
    alternates: { canonical: `/collections/${handle}` },
    openGraph: collection.image ? { images: [collection.image.url] } : undefined,
  };
}

export default function CollectionPage(props: PageProps<"/collections/[handle]">) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <CollectionHeader params={props.params} />
      </Suspense>
      <div className="container-wa pb-20 md:pb-28">
        <Suspense fallback={<GridSkeleton />}>
          <CollectionGrid {...props} />
        </Suspense>
      </div>
      <RecentlyViewed />
    </>
  );
}

async function CollectionHeader({ params }: Pick<PageProps<"/collections/[handle]">, "params">) {
  const { handle } = await params;
  const collection = await resolveCollection(handle);
  if (!collection) notFound();

  return (
    <section className="relative overflow-hidden border-b border-line bg-bg-soft">
      <MolecularLattice className="pointer-events-none absolute -top-16 -right-10 w-80 opacity-40" />
      <div className="container-wa relative py-14 text-center md:py-20">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="inline-flex items-center gap-2 text-[11px] tracking-wider text-muted uppercase">
            <li>
              <Link href="/" className="hover:text-fg">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-fg">
              {collection.title}
            </li>
          </ol>
        </nav>
        <h1 className="text-[32px] leading-tight font-light tracking-[0.08em] uppercase md:text-[46px]">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">{collection.description}</p>
        )}
      </div>
    </section>
  );
}

async function CollectionGrid({ params, searchParams }: PageProps<"/collections/[handle]">) {
  const [{ handle }, sp] = await Promise.all([params, searchParams]);
  const sortParam = typeof sp.sort === "string" ? sp.sort : undefined;
  const sort = resolveSort(sortParam);
  const rawFilters = Array.isArray(sp.filter) ? sp.filter : sp.filter ? [sp.filter] : [];
  const filters = parseFilters(rawFilters);

  const collection = await getCollection(handle);
  let data: Awaited<ReturnType<typeof getCollectionProducts>>;

  if (collection) {
    data = await getCollectionProducts({
      handle,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
      filters,
      first: PAGE_SIZE,
    });
  } else if (VIRTUAL[handle]) {
    // Collection not created in Shopify yet — show every product.
    const productSort = sort.sortKey === "COLLECTION_DEFAULT" ? undefined : sort.sortKey === "CREATED" ? "CREATED_AT" : sort.sortKey;
    const products = await getProducts({ sortKey: productSort, reverse: sort.reverse, first: 48 });
    data = { products, filters: [], pageInfo: { hasNextPage: false, endCursor: null } };
  } else {
    notFound();
  }

  return (
    <div className="pt-8">
      <CollectionToolbar filters={data.filters} count={data.products.length} />
      {data.products.length ? (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
          {data.products.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
          <LoadMore
            handle={handle}
            sort={sortParam}
            filters={rawFilters}
            initialPageInfo={data.pageInfo}
            shown={data.products.length}
          />
        </ul>
      ) : (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="serif-italic text-3xl">
            {filters.length ? "No matches for these filters" : "Arriving soon"}
          </p>
          <p className="mt-4 max-w-sm text-[14px] text-muted">
            {filters.length
              ? "Try removing a filter to see more of the collection."
              : "This edit is being prepared. Explore the full collection in the meantime."}
          </p>
          <ButtonLink href={filters.length ? `/collections/${handle}` : "/collections/shop-all"} variant="outline" className="mt-8">
            {filters.length ? "Clear filters" : "Shop all"}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="border-b border-line bg-bg-soft">
      <div className="container-wa flex flex-col items-center py-14 md:py-20">
        <div className="h-3 w-32 animate-pulse bg-surface" />
        <div className="mt-8 h-10 w-64 animate-pulse bg-surface" />
        <div className="mt-6 h-3 w-80 max-w-full animate-pulse bg-surface" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="pt-8">
      <div className="h-12 border-y border-line" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
