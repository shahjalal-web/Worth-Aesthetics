import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleCard } from "@/components/blog/article-card";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getBlog } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";

export function generateStaticParams() {
  return [{ blog: siteConfig.journalHandle }];
}

export async function generateMetadata({ params }: PageProps<"/blogs/[blog]">): Promise<Metadata> {
  const { blog: handle } = await params;
  const blog = await getBlog(handle);
  return {
    title: blog?.seo.title || blog?.title || "Journal",
    description: blog?.seo.description || "Peptide science, rituals and notes from Worth Aesthetics.",
    alternates: { canonical: `/blogs/${handle}` },
  };
}

export default function BlogPage(props: PageProps<"/blogs/[blog]">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <BlogContent params={props.params} />
    </Suspense>
  );
}

async function BlogContent({ params }: Pick<PageProps<"/blogs/[blog]">, "params">) {
  const { blog: handle } = await params;
  const blog = await getBlog(handle);
  if (!blog && handle !== siteConfig.journalHandle) notFound();
  const [lead, ...rest] = blog?.articles ?? [];

  return (
    <>
      <PageHero
        eyebrow="The Journal"
        title={blog?.title && blog.title !== "Journal" ? blog.title : "Notes on"}
        accent={blog?.title && blog.title !== "Journal" ? undefined : "skin & science"}
        intro="Peptide science, considered rituals and the thinking behind our formulas."
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal" }]}
      />
      <section className="container-wa py-16 md:py-24">
        {lead ? (
          <>
            <ArticleCard article={lead} large className="mx-auto max-w-4xl" />
            {rest.length > 0 && (
              <ul className="mt-20 grid gap-x-8 gap-y-16 border-t border-line pt-16 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <li key={a.id}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="serif-italic text-3xl">First entries arriving soon</p>
            <p className="mt-4 max-w-md text-[15px] text-muted">
              In the meantime, discover how peptides work in our science guide.
            </p>
            <ButtonLink href="/pages/science" variant="outline" className="mt-8">
              The Science
            </ButtonLink>
          </div>
        )}
      </section>
    </>
  );
}
