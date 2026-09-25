import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleCard, formatDate } from "@/components/blog/article-card";
import { MolecularDivider } from "@/components/brand/molecular";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/page-hero";
import { breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { getArticle, getArticlePaths, getBlog, getProducts } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const paths = await getArticlePaths();
  return paths.length
    ? paths.map((p) => ({ blog: p.blog, article: p.handle }))
    : [{ blog: siteConfig.journalHandle, article: "welcome" }];
}

export async function generateMetadata({ params }: PageProps<"/blogs/[blog]/[article]">): Promise<Metadata> {
  const { blog, article: handle } = await params;
  const article = await getArticle(blog, handle);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seo.title || article.title,
    description: article.seo.description || article.excerpt || undefined,
    alternates: { canonical: `/blogs/${blog}/${handle}` },
    openGraph: {
      type: "article",
      publishedTime: article.publishedAt,
      images: article.image ? [article.image.url] : undefined,
    },
  };
}

export default function ArticlePage(props: PageProps<"/blogs/[blog]/[article]">) {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <ArticleContent params={props.params} />
    </Suspense>
  );
}

async function ArticleContent({ params }: Pick<PageProps<"/blogs/[blog]/[article]">, "params">) {
  const { blog, article: handle } = await params;
  const article = await getArticle(blog, handle);
  if (!article) notFound();
  const [blogData, products] = await Promise.all([getBlog(blog), getProducts({ sortKey: "BEST_SELLING", first: 2 })]);
  const more = (blogData?.articles ?? []).filter((a) => a.handle !== handle).slice(0, 3);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedAt,
    author: article.authorV2 ? { "@type": "Person", name: article.authorV2.name } : undefined,
    image: article.image?.url,
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: absoluteUrl(`/blogs/${blog}/${handle}`),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: `/blogs/${blog}` },
            { name: article.title, path: `/blogs/${blog}/${handle}` },
          ]),
        )}
      />
      <article>
        <header className="container-wa max-w-4xl pt-12 text-center md:pt-20">
          <div className="flex justify-center">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal", href: `/blogs/${blog}` }, { label: "Article" }]} />
          </div>
          <p className="mt-8 font-display text-[10px] tracking-[0.2em] text-muted uppercase">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.authorV2?.name && <> · {article.authorV2.name}</>}
          </p>
          <h1 className="mt-5 text-[30px] leading-[1.15] font-light tracking-[0.05em] uppercase md:text-[46px]">{article.title}</h1>
          {article.excerpt && <p className="serif-italic mx-auto mt-6 max-w-2xl text-xl text-muted md:text-2xl">{article.excerpt}</p>}
        </header>
        {article.image && (
          <div className="container-wa mt-12 max-w-6xl">
            <div className="relative aspect-[16/9] overflow-hidden bg-surface">
              <Image src={article.image.url} alt={article.image.altText ?? ""} fill priority sizes="(min-width: 1280px) 1150px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className="container-wa grid max-w-6xl gap-14 py-16 md:py-20 lg:grid-cols-12">
          <div className="wa-prose md:text-[17px] lg:col-span-8" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          {products.length > 0 && (
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-32">
                <p className="eyebrow text-accent-ink">Shop the story</p>
                <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-10">
                  {products.map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 45vw" />
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
        {article.tags.length > 0 && (
          <ul className="container-wa flex max-w-6xl flex-wrap gap-2 pb-12">
            {article.tags.map((t) => (
              <li key={t} className="border border-line px-3 py-1 text-[11px] tracking-wider text-muted uppercase">
                {t}
              </li>
            ))}
          </ul>
        )}
      </article>

      {more.length > 0 && (
        <section className="border-t border-line py-16 md:py-24">
          <div className="container-wa">
            <MolecularDivider className="mx-auto mb-10 max-w-xs" />
            <h2 className="text-center text-[24px] font-light tracking-[0.08em] uppercase">
              Continue <span className="serif-italic tracking-normal normal-case text-accent-ink">reading</span>
            </h2>
            <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3">
              {more.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
            <div className="mt-12 text-center">
              <Link href={`/blogs/${blog}`} className="label-caps text-[10.5px] underline decoration-accent underline-offset-[6px]">
                All journal entries
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
