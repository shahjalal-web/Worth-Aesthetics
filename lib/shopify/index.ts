import "server-only";
import { fallbackPolicies } from "@/content/policy-fallbacks";
import { cacheLife, cacheTag } from "next/cache";
import { isShopifyConfigured, shopifyFetch } from "./client";
import { HIDDEN_PRODUCT_TAG, TAGS } from "./constants";
import {
  addToCartMutation,
  createCartMutation,
  removeFromCartMutation,
  updateCartLinesMutation,
  updateCartNoteMutation,
  updateBuyerIdentityMutation,
} from "./mutations";
import {
  getArticleQuery,
  getBlogQuery,
  getBlogsQuery,
  getCartQuery,
  getLatestArticlesQuery,
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getMetaobjectsQuery,
  getPageQuery,
  getProductHandlesQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
  getShopPoliciesQuery,
  predictiveSearchQuery,
} from "./queries";
import type {
  Article,
  ArticleCard,
  Blog,
  Testimonial,
  Cart,
  CartLine,
  Collection,
  FaqItem,
  Filter,
  HeroSlide,
  Image,
  Ingredient,
  Money,
  PageInfo,
  Policy,
  Product,
  ProductCardData,
  ProductVariant,
  ShopPage,
} from "./types";

export { isShopifyConfigured };

/* ------------------------------------------------------------------ */
/* Raw shapes                                                         */
/* ------------------------------------------------------------------ */
type Nodes<T> = { nodes: T[] };
type MetaKV = { key: string; value: string } | null;

type RawProductCard = Omit<
  ProductCardData,
  "images" | "variants" | "options" | "meta"
> & {
  images: Nodes<Image>;
  variants: Nodes<ProductVariant>;
  options: { id: string; name: string; optionValues: { name: string }[] }[];
  cardMeta: MetaKV[];
};

type RawMetaobjectField = {
  key: string;
  value: string | null;
  reference?: { image?: Image } | null;
};

type RawProduct = RawProductCard &
  Omit<Product, "images" | "variants" | "options" | "meta" | keyof ProductCardData> & {
    gallery: Nodes<Image>;
    allVariants: Nodes<ProductVariant>;
    detailMeta: MetaKV[];
    keyIngredients: { references: Nodes<{ fields?: RawMetaobjectField[] }> } | null;
    faq: { references: Nodes<{ fields?: RawMetaobjectField[] }> } | null;
    pairsWellWith: { references: Nodes<RawProductCard | Record<string, never>> } | null;
  };

type RawCart = Omit<Cart, "lines"> & { lines: Nodes<CartLine> };

/* ------------------------------------------------------------------ */
/* Reshapers                                                          */
/* ------------------------------------------------------------------ */
function metaMap(list: MetaKV[] | undefined) {
  const map: Record<string, string> = {};
  for (const m of list ?? []) if (m?.value) map[m.key] = m.value;
  return map;
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [value];
  }
}

function fieldsToRecord(fields: RawMetaobjectField[] = []) {
  const record: Record<string, RawMetaobjectField> = {};
  for (const f of fields) record[f.key] = f;
  return record;
}

/** Converts Shopify rich_text JSON into a very small, safe HTML string. */
export function richTextToHtml(value: string | undefined | null): string | null {
  if (!value) return null;
  type Node = {
    type: string;
    value?: string;
    bold?: boolean;
    italic?: boolean;
    level?: number;
    listType?: string;
    url?: string;
    children?: Node[];
  };
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const render = (n: Node): string => {
    const kids = (n.children ?? []).map(render).join("");
    switch (n.type) {
      case "root":
        return kids;
      case "paragraph":
        return `<p>${kids}</p>`;
      case "heading":
        return `<h${n.level ?? 3}>${kids}</h${n.level ?? 3}>`;
      case "list":
        return n.listType === "ordered" ? `<ol>${kids}</ol>` : `<ul>${kids}</ul>`;
      case "list-item":
        return `<li>${kids}</li>`;
      case "link":
        return `<a href="${esc(n.url ?? "#")}">${kids}</a>`;
      case "text": {
        let t = esc(n.value ?? "");
        if (n.bold) t = `<strong>${t}</strong>`;
        if (n.italic) t = `<em>${t}</em>`;
        return t;
      }
      default:
        return kids;
    }
  };
  try {
    return render(JSON.parse(value));
  } catch {
    return `<p>${esc(value)}</p>`;
  }
}

function reshapeOptions(options: RawProductCard["options"]) {
  return options.map((o) => ({ id: o.id, name: o.name, values: o.optionValues.map((v) => v.name) }));
}

function reshapeProductCard(raw: RawProductCard): ProductCardData {
  const m = metaMap(raw.cardMeta);
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    productType: raw.productType,
    availableForSale: raw.availableForSale,
    tags: raw.tags,
    priceRange: raw.priceRange,
    compareAtPriceRange: raw.compareAtPriceRange,
    featuredImage: raw.featuredImage,
    images: raw.images.nodes,
    variants: raw.variants.nodes,
    options: reshapeOptions(raw.options),
    meta: {
      subtitle: m.subtitle ?? null,
      activeComplex: m.active_complex ?? null,
      sizeLabel: m.size_label ?? null,
      badge: m.badge ?? null,
      skinConcerns: parseList(m.skin_concerns),
      skinTypes: parseList(m.skin_types),
      routineStep: m.routine_step ?? null,
    },
  };
}

function reshapeProductCards(list: RawProductCard[]) {
  return list
    .filter((p) => p && !p.tags?.includes(HIDDEN_PRODUCT_TAG))
    .map(reshapeProductCard);
}

function reshapeProduct(raw: RawProduct): Product {
  const card = reshapeProductCard(raw);
  const d = metaMap(raw.detailMeta);

  const keyIngredients: Ingredient[] = (raw.keyIngredients?.references.nodes ?? [])
    .map((n) => fieldsToRecord(n.fields))
    .filter((f) => f.name?.value)
    .map((f) => ({
      name: f.name!.value!,
      inci: f.inci?.value ?? null,
      description: f.short_description?.value ?? null,
      image: f.image?.reference?.image ?? null,
    }));

  const faq: FaqItem[] = (raw.faq?.references.nodes ?? [])
    .map((n) => fieldsToRecord(n.fields))
    .filter((f) => f.question?.value && f.answer?.value)
    .map((f) => ({ question: f.question!.value!, answer: f.answer!.value! }));

  const pairsWellWith = reshapeProductCards(
    (raw.pairsWellWith?.references.nodes ?? []).filter(
      (n): n is RawProductCard => "handle" in n,
    ),
  );

  return {
    ...card,
    vendor: raw.vendor,
    productType: raw.productType,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    updatedAt: raw.updatedAt,
    seo: raw.seo,
    images: raw.gallery.nodes,
    variants: raw.allVariants.nodes,
    meta: {
      ...card.meta,
      benefits: parseList(d.benefits),
      resultsClaims: parseList(d.results_claims),
      howToUse: richTextToHtml(d.how_to_use),
      fullIngredients: d.full_ingredients_inci ?? null,
      keyIngredients,
      faq,
      pairsWellWith,
    },
  };
}

function reshapeCart(raw: RawCart): Cart {
  return {
    ...raw,
    cost: {
      ...raw.cost,
      totalTaxAmount: raw.cost.totalTaxAmount ?? null,
    },
    lines: raw.lines.nodes,
  };
}

/* ------------------------------------------------------------------ */
/* Catalog (cached, tag-revalidated via /api/revalidate)             */
/* ------------------------------------------------------------------ */
export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products, `product:${handle}`);
  cacheLife("days");
  if (!isShopifyConfigured()) return undefined;
  const data = await shopifyFetch<{ product: RawProduct | null }>({
    query: getProductQuery,
    variables: { handle },
  });
  if (!data.product || data.product.tags.includes(HIDDEN_PRODUCT_TAG)) return undefined;
  return reshapeProduct(data.product);
}

export type ProductSort = "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE";

export async function getProducts({
  query,
  sortKey,
  reverse,
  first = 24,
}: {
  query?: string;
  sortKey?: ProductSort;
  reverse?: boolean;
  first?: number;
} = {}): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{ products: Nodes<RawProductCard> }>({
    query: getProductsQuery,
    variables: { query, sortKey, reverse, first },
  });
  return reshapeProductCards(data.products.nodes);
}

export async function getProductHandles(): Promise<{ handle: string; updatedAt: string }[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{ products: Nodes<{ handle: string; updatedAt: string }> }>({
    query: getProductHandlesQuery,
  });
  return data.products.nodes;
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections, `collection:${handle}`);
  cacheLife("days");
  if (!isShopifyConfigured()) return undefined;
  const data = await shopifyFetch<{ collection: Collection | null }>({
    query: getCollectionQuery,
    variables: { handle },
  });
  return data.collection ?? undefined;
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{ collections: Nodes<Collection> }>({ query: getCollectionsQuery });
  return data.collections.nodes.filter((c) => !c.handle.startsWith("hidden"));
}

export type CollectionSort = "COLLECTION_DEFAULT" | "BEST_SELLING" | "CREATED" | "PRICE" | "TITLE";

export async function getCollectionProducts({
  handle,
  sortKey,
  reverse,
  filters = [],
  first = 24,
  after,
}: {
  handle: string;
  sortKey?: CollectionSort;
  reverse?: boolean;
  filters?: Record<string, unknown>[];
  first?: number;
  after?: string;
}): Promise<{ products: ProductCardData[]; filters: Filter[]; pageInfo: PageInfo }> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products, `collection:${handle}`);
  cacheLife("days");
  const empty = { products: [], filters: [], pageInfo: { hasNextPage: false, endCursor: null } };
  if (!isShopifyConfigured()) return empty;
  const data = await shopifyFetch<{
    collection: {
      products: Nodes<RawProductCard> & { filters: Filter[]; pageInfo: PageInfo };
    } | null;
  }>({
    query: getCollectionProductsQuery,
    variables: { handle, sortKey, reverse, filters, first, after },
  });
  if (!data.collection) return empty;
  const { nodes, filters: f, pageInfo } = data.collection.products;
  return { products: reshapeProductCards(nodes), filters: f, pageInfo };
}

/**
 * Shopify's own recommendation engine. RELATED = learned from browsing/purchase
 * behaviour; COMPLEMENTARY = pairings set manually in the Search & Discovery app.
 */
export async function getProductRecommendations(
  productId: string,
  intent: "RELATED" | "COMPLEMENTARY" = "RELATED",
): Promise<ProductCardData[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{ productRecommendations: RawProductCard[] | null }>({
    query: getProductRecommendationsQuery,
    variables: { productId, intent },
  });
  return reshapeProductCards(data.productRecommendations ?? []);
}

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */
type RawMetaobject = { id: string; handle: string; fields: RawMetaobjectField[] };

async function getMetaobjects(type: string, first = 10): Promise<RawMetaobject[]> {
  "use cache";
  cacheTag(TAGS.content, `metaobject:${type}`);
  cacheLife("days");
  if (!isShopifyConfigured()) return [];
  try {
    const data = await shopifyFetch<{ metaobjects: Nodes<RawMetaobject> }>({
      query: getMetaobjectsQuery,
      variables: { type, first },
    });
    return data.metaobjects.nodes;
  } catch {
    // Metaobject definition not created yet (or not storefront-readable).
    return [];
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const items = await getMetaobjects("hero_slide", 5);
  return items
    .map((m) => {
      const f = fieldsToRecord(m.fields);
      return {
        id: m.id,
        headline: f.headline?.value ?? "",
        subline: f.subline?.value ?? null,
        eyebrow: f.eyebrow?.value ?? null,
        ctaLabel: f.cta_label?.value ?? null,
        ctaLink: f.cta_link?.value ?? null,
        image: f.image?.reference?.image ?? null,
      };
    })
    .filter((s) => s.headline);
}

export async function getAnnouncements(): Promise<string[]> {
  const items = await getMetaobjects("announcement", 5);
  return items
    .map((m) => fieldsToRecord(m.fields).text?.value ?? "")
    .filter(Boolean);
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const items = await getMetaobjects("faq_item", 100);
  return items
    .map((m) => fieldsToRecord(m.fields))
    .filter((f) => f.question?.value && f.answer?.value)
    .map((f) => ({ question: f.question!.value!, answer: f.answer!.value!, category: f.category?.value ?? null }));
}

export async function getIngredients(): Promise<Ingredient[]> {
  const items = await getMetaobjects("ingredient", 50);
  return items
    .map((m) => fieldsToRecord(m.fields))
    .filter((f) => f.name?.value)
    .map((f) => ({
      name: f.name!.value!,
      inci: f.inci?.value ?? null,
      description: f.short_description?.value ?? null,
      image: f.image?.reference?.image ?? null,
    }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const items = await getMetaobjects("testimonial", 12);
  return items
    .map((m) => ({ id: m.id, f: fieldsToRecord(m.fields) }))
    .filter(({ f }) => f.quote?.value && f.author?.value)
    .map(({ id, f }) => ({ id, quote: f.quote!.value!, author: f.author!.value! }));
}

/* Blog / Journal */
export async function getBlog(handle: string): Promise<Blog | undefined> {
  "use cache";
  cacheTag(TAGS.content, `blog:${handle}`);
  cacheLife("hours") // no Shopify webhook exists for blogs/pages/policies;
  if (!isShopifyConfigured()) return undefined;
  const data = await shopifyFetch<{ blog: (Omit<Blog, "articles"> & { articles: Nodes<ArticleCard> }) | null }>({
    query: getBlogQuery,
    variables: { handle },
  });
  if (!data.blog) return undefined;
  return { ...data.blog, articles: data.blog.articles.nodes };
}

export async function getLatestArticles(first = 3): Promise<ArticleCard[]> {
  "use cache";
  cacheTag(TAGS.content, "articles");
  cacheLife("hours") // no Shopify webhook exists for blogs/pages/policies;
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{ articles: Nodes<ArticleCard> }>({ query: getLatestArticlesQuery, variables: { first } });
  return data.articles.nodes;
}

export async function getArticle(blog: string, handle: string): Promise<Article | undefined> {
  "use cache";
  cacheTag(TAGS.content, `article:${blog}/${handle}`);
  cacheLife("hours") // no Shopify webhook exists for blogs/pages/policies;
  if (!isShopifyConfigured()) return undefined;
  const data = await shopifyFetch<{ blog: { articleByHandle: Article | null } | null }>({
    query: getArticleQuery,
    variables: { blog, handle },
  });
  return data.blog?.articleByHandle ?? undefined;
}

export async function getArticlePaths(): Promise<{ blog: string; handle: string; publishedAt: string }[]> {
  "use cache";
  cacheTag(TAGS.content, "articles");
  cacheLife("hours") // no Shopify webhook exists for blogs/pages/policies;
  if (!isShopifyConfigured()) return [];
  const data = await shopifyFetch<{
    blogs: Nodes<{ handle: string; articles: Nodes<{ handle: string; publishedAt: string }> }>;
  }>({ query: getBlogsQuery });
  return data.blogs.nodes.flatMap((b) => b.articles.nodes.map((a) => ({ blog: b.handle, ...a })));
}

export async function getPage(handle: string): Promise<ShopPage | undefined> {
  "use cache";
  cacheTag(TAGS.content, `page:${handle}`);
  cacheLife("hours") // no Shopify webhook exists for blogs/pages/policies;
  if (!isShopifyConfigured()) return undefined;
  const data = await shopifyFetch<{ page: ShopPage | null }>({
    query: getPageQuery,
    variables: { handle },
  });
  return data.page ?? undefined;
}

export async function getPolicies(): Promise<Policy[]> {
  "use cache";
  cacheTag(TAGS.content, "policies");
  cacheLife("hours") // no Shopify webhook exists for blogs/pages/policies;
  if (!isShopifyConfigured()) return fallbackPolicies;
  const data = await shopifyFetch<{ shop: Record<string, Policy | null | string> }>({
    query: getShopPoliciesQuery,
  });
  const published = ["privacyPolicy", "refundPolicy", "shippingPolicy", "termsOfService"]
    .map((k) => data.shop[k] as Policy | null)
    .filter((p): p is Policy => Boolean(p?.body));
  // Interim summaries fill any policy not yet written in Shopify admin; Shopify's text always wins.
  return [...published, ...fallbackPolicies.filter((f) => !published.some((p) => p.handle === f.handle))];
}

/* ------------------------------------------------------------------ */
/* Search (uncached — per keystroke)                                  */
/* ------------------------------------------------------------------ */
export async function predictiveSearch(query: string) {
  if (!isShopifyConfigured() || !query.trim()) {
    return { queries: [], products: [], collections: [] };
  }
  const data = await shopifyFetch<{
    predictiveSearch: {
      queries: { text: string }[];
      products: RawProductCard[];
      collections: { handle: string; title: string }[];
    };
  }>({ query: predictiveSearchQuery, variables: { query } });
  return {
    queries: data.predictiveSearch.queries.map((q) => q.text),
    products: reshapeProductCards(data.predictiveSearch.products),
    collections: data.predictiveSearch.collections,
  };
}

/* ------------------------------------------------------------------ */
/* Cart (never cached)                                                */
/* ------------------------------------------------------------------ */
type CartPayload = { cart: RawCart | null; userErrors: { message: string }[] };

function unwrapCart(payload: CartPayload): Cart {
  if (!payload.cart) throw new Error(payload.userErrors[0]?.message ?? "Cart error");
  return reshapeCart(payload.cart);
}

export async function getCart(cartId: string | undefined): Promise<Cart | undefined> {
  if (!cartId || !isShopifyConfigured()) return undefined;
  try {
    const data = await shopifyFetch<{ cart: RawCart | null }>({
      query: getCartQuery,
      variables: { cartId },
    });
    // Old carts (e.g. completed checkout) come back null.
    return data.cart ? reshapeCart(data.cart) : undefined;
  } catch {
    return undefined;
  }
}

export async function createCart(lines?: { merchandiseId: string; quantity: number }[]) {
  const data = await shopifyFetch<{ cartCreate: CartPayload }>({
    query: createCartMutation,
    variables: { lines },
  });
  return unwrapCart(data.cartCreate);
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const data = await shopifyFetch<{ cartLinesAdd: CartPayload }>({
    query: addToCartMutation,
    variables: { cartId, lines },
  });
  return unwrapCart(data.cartLinesAdd);
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  const data = await shopifyFetch<{ cartLinesUpdate: CartPayload }>({
    query: updateCartLinesMutation,
    variables: { cartId, lines },
  });
  return unwrapCart(data.cartLinesUpdate);
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const data = await shopifyFetch<{ cartLinesRemove: CartPayload }>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
  });
  return unwrapCart(data.cartLinesRemove);
}

export async function updateCartNote(cartId: string, note: string) {
  const data = await shopifyFetch<{ cartNoteUpdate: CartPayload }>({
    query: updateCartNoteMutation,
    variables: { cartId, note },
  });
  return unwrapCart(data.cartNoteUpdate);
}

export type { Money };

/** Links the cart to a signed-in customer so checkout is pre-filled and the order lands in their account. */
export async function linkCartToCustomer(cartId: string, customerAccessToken: string) {
  const data = await shopifyFetch<{ cartBuyerIdentityUpdate: { userErrors: { message: string }[] } }>({
    query: updateBuyerIdentityMutation,
    variables: { cartId, buyerIdentity: { customerAccessToken } },
  });
  return data.cartBuyerIdentityUpdate.userErrors;
}
