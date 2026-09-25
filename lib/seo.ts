import type { FaqItem, Product } from "./shopify/types";
import { siteConfig } from "./site-config";
import { absoluteUrl } from "./utils";

/** Serialises JSON-LD safely for inline <script> tags. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/products/${product.handle}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: siteConfig.name },
    url,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.id.split("/").pop(),
      name: v.title,
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    })),
    // AggregateRating added once a reviews provider is integrated (TBC) — never fabricated.
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    // logo: TBC — add once the official SVG/PNG logo is provided.
  };
}
