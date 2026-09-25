/* Normalised storefront types. Raw GraphQL shapes live next to their queries. */

export type Money = { amount: string; currencyCode: string };

export type Image = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SelectedOption = { name: string; value: string };

export type ProductOption = { id: string; name: string; values: string[] };

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type Ingredient = {
  name: string;
  description: string | null;
  image: Image | null;
};

export type FaqItem = { question: string; answer: string };

/** Content stored in product metafields (namespace `wa`). All optional. */
export type ProductMeta = {
  subtitle: string | null;
  activeComplex: string | null;
  sizeLabel: string | null;
  badge: string | null;
  routineStep: string | null;
  benefits: string[];
  skinConcerns: string[];
  skinTypes: string[];
  resultsClaims: string[];
  howToUse: string | null; // rich_text JSON rendered to HTML-safe nodes
  fullIngredients: string | null;
  keyIngredients: Ingredient[];
  faq: FaqItem[];
  pairsWellWith: ProductCardData[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  tags: string[];
  options: ProductOption[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money };
  featuredImage: Image | null;
  images: Image[];
  variants: ProductVariant[];
  seo: { title: string | null; description: string | null };
  updatedAt: string;
  meta: ProductMeta;
};

/** Lightweight shape for cards, rails and the cart upsell. */
export type ProductCardData = Pick<
  Product,
  | "id"
  | "handle"
  | "title"
  | "availableForSale"
  | "priceRange"
  | "compareAtPriceRange"
  | "featuredImage"
  | "images"
  | "variants"
  | "options"
  | "tags"
> & {
  meta: Pick<ProductMeta, "subtitle" | "activeComplex" | "sizeLabel" | "badge">;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
};

export type FilterValue = {
  id: string;
  label: string;
  count: number;
  input: string; // JSON-encoded ProductFilter
};

export type Filter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: FilterValue[];
};

export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money; compareAtAmountPerQuantity: Money | null };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: Image | null;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Image | null;
    };
  };
};

export type Cart = {
  id: string | undefined;
  checkoutUrl: string;
  note: string | null;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money; totalTaxAmount: Money | null };
  lines: CartLine[];
};

export type HeroSlide = {
  id: string;
  headline: string;
  subline: string | null;
  eyebrow: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  image: Image | null;
};

export type ShopPage = {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
  seo: { title: string | null; description: string | null };
};

export type Policy = { title: string; handle: string; body: string; url: string };
