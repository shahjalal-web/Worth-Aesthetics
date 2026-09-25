import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPage } from "@/lib/shopify";

/** Generic Shopify page (Online Store → Pages). Bespoke pages (Science, About) come in Phase 3. */
export async function generateStaticParams() {
  return [{ handle: "about" }];
}

export async function generateMetadata({ params }: PageProps<"/pages/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seo.title || page.title,
    description: page.seo.description || page.bodySummary,
    alternates: { canonical: `/pages/${handle}` },
  };
}

export default function ShopifyPage(props: PageProps<"/pages/[handle]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PageContent params={props.params} />
    </Suspense>
  );
}

async function PageContent({ params }: Pick<PageProps<"/pages/[handle]">, "params">) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) notFound();
  return (
    <article className="container-wa max-w-3xl py-16 md:py-24">
      <h1 className="text-center text-[30px] font-light tracking-[0.08em] uppercase md:text-[42px]">{page.title}</h1>
      <div className="wa-prose mt-12 border-t border-line pt-12" dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}
