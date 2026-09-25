import Image from "next/image";
import Link from "next/link";
import type { ArticleCard as Article } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function ArticleCard({ article, large, className }: { article: Article; large?: boolean; className?: string }) {
  const href = `/blogs/${article.blog.handle}/${article.handle}`;
  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block">
        <div className={cn("relative overflow-hidden bg-surface", large ? "aspect-[16/10]" : "aspect-[4/3]")}>
          {article.image ? (
            <Image
              src={article.image.url}
              alt={article.image.altText ?? ""}
              fill
              sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"}
              className="object-cover transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="serif-italic text-2xl text-accent-ink">Journal</span>
            </div>
          )}
        </div>
        <p className="mt-5 font-display text-[10px] tracking-[0.2em] text-muted uppercase">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </p>
        <h3
          className={cn(
            "mt-3 leading-snug font-light tracking-[0.04em] uppercase transition-colors group-hover:text-accent-ink",
            large ? "text-[24px] md:text-[30px]" : "text-[17px]",
          )}
        >
          {article.title}
        </h3>
        {article.excerpt && <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-muted">{article.excerpt}</p>}
        <span className="label-caps mt-4 inline-block text-[10px] underline decoration-accent underline-offset-[6px]">Read more</span>
      </Link>
    </article>
  );
}
