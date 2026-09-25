import type { MetadataRoute } from "next";
import { getArticlePaths, getCollections, getPolicies, getProductHandles } from "@/lib/shopify";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/utils";

const STATIC = [
  "/",
  "/collections/shop-all",
  "/pages/science",
  "/pages/about",
  "/pages/ingredients",
  "/pages/routine",
  "/pages/faq",
  "/pages/contact",
  "/pages/accessibility",
  `/blogs/${siteConfig.journalHandle}`,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, articles, policies] = await Promise.all([
    getProductHandles(),
    getCollections(),
    getArticlePaths(),
    getPolicies(),
  ]);

  return [
    ...STATIC.map((path) => ({ url: absoluteUrl(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...collections
      .filter((c) => c.handle !== "frontpage" && c.handle !== "shop-all")
      .map((c) => ({ url: absoluteUrl(`/collections/${c.handle}`), lastModified: c.updatedAt, priority: 0.8 })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.handle}`), lastModified: p.updatedAt, priority: 0.9 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/blogs/${a.blog}/${a.handle}`), lastModified: a.publishedAt, priority: 0.6 })),
    ...policies.map((p) => ({ url: absoluteUrl(`/policies/${p.handle}`), priority: 0.3 })),
  ];
}
