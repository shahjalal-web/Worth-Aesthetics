import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { SearchIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <section className="container-wa pt-12 pb-24 md:pt-16">
      <h1 className="sr-only">Search</h1>
      <form action="/search" role="search" className="mx-auto max-w-2xl">
        <label htmlFor="q" className="eyebrow block text-center text-accent-ink">
          Search the collection
        </label>
        <div className="mt-6 flex items-center border-b border-fg/70 focus-within:border-accent">
          <SearchIcon className="size-5 text-muted" />
          <Suspense fallback={<SearchInput />}>
            <SearchInputWithValue searchParams={props.searchParams} />
          </Suspense>
        </div>
      </form>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}

function SearchInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <input
      id="q"
      name="q"
      type="search"
      defaultValue={defaultValue}
      autoComplete="off"
      placeholder="Serum, peptide, GHK-Cu…"
      className="h-14 flex-1 bg-transparent px-4 text-lg font-light outline-none placeholder:text-muted"
    />
  );
}

async function SearchInputWithValue({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const q = (await searchParams).q;
  return <SearchInput defaultValue={typeof q === "string" ? q : ""} />;
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const raw = (await searchParams).q;
  const q = typeof raw === "string" ? raw.trim().slice(0, 100) : "";
  if (!q) return null;
  const products = await getProducts({ query: q, sortKey: "RELEVANCE", first: 24 });

  return (
    <div className="mt-14">
      <p className="text-center text-[13px] text-muted" aria-live="polite">
        {products.length} {products.length === 1 ? "result" : "results"} for “{q}”
      </p>
      {products.length ? (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 flex flex-col items-center text-center">
          <p className="serif-italic text-2xl">Nothing found</p>
          <p className="mt-3 text-[14px] text-muted">Try a different term, or explore the full collection.</p>
          <ButtonLink href="/collections/shop-all" variant="outline" className="mt-8">
            Shop all
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-24 grid grid-cols-2 gap-6 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
