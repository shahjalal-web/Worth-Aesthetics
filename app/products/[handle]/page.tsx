import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MolecularDivider } from "@/components/brand/molecular";
import { ProductGallery } from "@/components/product/gallery";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { ProductPurchase } from "@/components/product/product-purchase";
import { RecentlyViewed, TrackRecentlyViewed } from "@/components/product/recently-viewed";
import { AccordionItem } from "@/components/ui/accordion";
import { TruckIcon } from "@/components/ui/icons";
import { PaymentBadges, TrustRow } from "@/components/ui/trust-row";
import { breadcrumbJsonLd, faqJsonLd, jsonLd, productJsonLd } from "@/lib/seo";
import { getProduct, getProductHandles, getProductRecommendations } from "@/lib/shopify";
import type { Product } from "@/lib/shopify/types";
import { siteConfig } from "@/lib/site-config";

export async function generateStaticParams() {
  const handles = await getProductHandles();
  // Cache Components requires at least one entry; the placeholder renders the 404 shell.
  return handles.length ? handles.map(({ handle }) => ({ handle })) : [{ handle: "coming-soon" }];
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product not found" };
  const image = product.featuredImage;
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.meta.subtitle || product.description.slice(0, 160),
    alternates: { canonical: `/products/${handle}` },
    openGraph: image
      ? { images: [{ url: image.url, width: image.width ?? undefined, height: image.height ?? undefined, alt: image.altText ?? product.title }] }
      : undefined,
  };
}

export default function ProductPage(props: PageProps<"/products/[handle]">) {
  return (
    <Suspense fallback={<PdpSkeleton />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/products/[handle]">, "params">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const { meta } = product;
  const variant = product.variants[0];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productJsonLd(product))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop All", path: "/collections/shop-all" },
            { name: product.title, path: `/products/${product.handle}` },
          ]),
        )}
      />
      {meta.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd(meta.faq))} />
      )}
      <TrackRecentlyViewed
        item={{
          handle: product.handle,
          title: product.title,
          image: product.featuredImage?.url ?? null,
          price: product.priceRange.minVariantPrice,
          subline: meta.activeComplex,
        }}
      />

      <section className="container-wa pt-6 pb-16 md:pt-10 md:pb-24">
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-wider text-muted uppercase">
            <li>
              <Link href="/" className="hover:text-fg">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/collections/shop-all" className="hover:text-fg">Shop</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="truncate text-fg">{product.title}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="-mx-5 md:mx-0 lg:sticky lg:top-28 lg:col-span-7 lg:self-start">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="lg:col-span-5">
            {meta.badge && <p className="eyebrow text-accent-ink">{meta.badge}</p>}
            <h1 className="mt-3 text-[26px] leading-[1.2] font-light tracking-[0.08em] uppercase md:text-[34px]">
              {product.title}
            </h1>
            {meta.activeComplex && <p className="serif-italic mt-3 text-xl text-muted md:text-2xl">{meta.activeComplex}</p>}
            {meta.sizeLabel && (
              <p className="mt-3 font-display text-[10px] font-medium tracking-[0.2em] text-muted uppercase">{meta.sizeLabel}</p>
            )}
            {meta.subtitle && <p className="mt-5 text-[15px] leading-relaxed">{meta.subtitle}</p>}

            <div className="mt-8 border-t border-line pt-8">
              {variant && <ProductPurchase product={product} />}
            </div>

            <div className="mt-6 space-y-2 text-[13px] text-muted">
              <p className="flex items-center gap-2.5">
                <TruckIcon className="size-4 text-accent" />
                Free US shipping on orders over ${siteConfig.freeShippingThreshold}. {siteConfig.dispatchText}
              </p>
              <p>
                Pay in full or in installments with <span className="text-fg">Shop Pay</span>. Apple Pay, Google
                Pay &amp; PayPal accepted at checkout.
              </p>
            </div>
            <PaymentBadges className="mt-4 justify-start!" />

            {meta.benefits.length > 0 && (
              <ul className="mt-10 space-y-3 border-t border-line pt-8 text-[14px]">
                {meta.benefits.map((b) => (
                  <li key={b} className="flex gap-4">
                    <span className="mt-2.5 h-px w-5 shrink-0 bg-accent" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 border-t border-line">
              {product.descriptionHtml && (
                <AccordionItem title="Details" defaultOpen>
                  <div className="wa-prose text-[14px]! text-muted!" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                </AccordionItem>
              )}
              {meta.howToUse && (
                <AccordionItem title="How to use">
                  <div className="wa-prose text-[14px]! text-muted!" dangerouslySetInnerHTML={{ __html: meta.howToUse }} />
                </AccordionItem>
              )}
              {meta.keyIngredients.length > 0 && (
                <AccordionItem title="Key ingredients">
                  <ul className="space-y-3">
                    {meta.keyIngredients.map((i) => (
                      <li key={i.name}>
                        <span className="text-fg">{i.name}</span>
                        {i.description && <> — {i.description}</>}
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {meta.fullIngredients && (
                <AccordionItem title="Full ingredients (INCI)">
                  <p className="text-[12.5px] tracking-wide uppercase">{meta.fullIngredients}</p>
                </AccordionItem>
              )}
              <AccordionItem title="Shipping & returns">
                <p>
                  Complimentary US shipping on orders over ${siteConfig.freeShippingThreshold}. {siteConfig.dispatchText}{" "}
                  {siteConfig.returnsText}{" "}
                  <Link href="/policies/refund-policy" className="text-fg underline decoration-accent underline-offset-4">
                    Read our returns policy
                  </Link>
                  .
                </p>
              </AccordionItem>
            </div>

            <TrustRow className="mt-10" />
          </div>
        </div>
      </section>

      <IngredientSpotlight product={product} />

      <Suspense fallback={<RailSkeleton />}>
        <CompleteRoutine product={product} />
      </Suspense>

      {meta.faq.length > 0 && (
        <section className="border-t border-line py-20 md:py-24" aria-labelledby="pdp-faq">
          <div className="container-wa max-w-3xl">
            <h2 id="pdp-faq" className="text-center text-[24px] font-light tracking-[0.08em] uppercase md:text-[30px]">
              Questions, <span className="serif-italic tracking-normal normal-case text-accent-ink">answered</span>
            </h2>
            <div className="mt-10 border-t border-line">
              {meta.faq.map((f) => (
                <AccordionItem key={f.question} title={f.question}>
                  <p>{f.answer}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed exclude={product.handle} />
    </>
  );
}

function IngredientSpotlight({ product }: { product: Product }) {
  const items = product.meta.keyIngredients;
  if (!items.length) return null;
  return (
    <section className="bg-surface py-20 md:py-24" aria-labelledby="ingredients">
      <div className="container-wa">
        <div className="text-center">
          <p className="eyebrow text-accent-ink">Inside the formula</p>
          <h2 id="ingredients" className="mt-4 text-[24px] font-light tracking-[0.08em] uppercase md:text-[30px]">
            Key <span className="serif-italic tracking-normal normal-case text-accent-ink">actives</span>
          </h2>
        </div>
        <ul className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((ing) => (
            <li key={ing.name} className="bg-surface p-8">
              {ing.image && (
                <div className="relative mb-6 aspect-square w-20 overflow-hidden rounded-full">
                  <Image src={ing.image.url} alt="" fill sizes="80px" className="object-cover" />
                </div>
              )}
              <p className="text-2xl font-extralight tracking-[0.04em]">{ing.name}</p>
              <MolecularDivider className="my-5 opacity-70" />
              {ing.description && <p className="text-[14px] leading-relaxed text-muted">{ing.description}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function CompleteRoutine({ product }: { product: Product }) {
  const products = product.meta.pairsWellWith.length
    ? product.meta.pairsWellWith
    : await getProductRecommendations(product.id);
  const list = products.filter((p) => p.handle !== product.handle).slice(0, 4);
  if (!list.length) return null;
  return (
    <section className="py-20 md:py-24" aria-labelledby="routine">
      <div className="container-wa">
        <div className="text-center">
          <p className="eyebrow text-accent-ink">Pairs beautifully with</p>
          <h2 id="routine" className="mt-4 text-[24px] font-light tracking-[0.08em] uppercase md:text-[30px]">
            Complete your <span className="serif-italic tracking-normal normal-case text-accent-ink">ritual</span>
          </h2>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {list.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RailSkeleton() {
  return (
    <div className="container-wa grid grid-cols-2 gap-6 py-20 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function PdpSkeleton() {
  return (
    <div className="container-wa grid gap-10 pt-16 pb-24 lg:grid-cols-12 lg:gap-14">
      <div className="aspect-[4/5] animate-pulse bg-surface lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="h-8 w-3/4 animate-pulse bg-surface" />
        <div className="h-5 w-1/2 animate-pulse bg-surface" />
        <div className="mt-10 h-14 animate-pulse bg-surface" />
      </div>
    </div>
  );
}
