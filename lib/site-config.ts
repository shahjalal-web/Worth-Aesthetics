/**
 * Site-wide configuration. Anything marked TBC is a placeholder awaiting
 * client confirmation — see docs/OPEN_QUESTIONS.md. Do not present TBC
 * items as facts in production.
 */
export const siteConfig = {
  name: "Worth Aesthetics",
  tagline: "Clinical peptide science. Understated luxury.",
  description:
    "Peptide skincare formulated with clinical precision — Snap-8, GHK-Cu, NAD+ and PDRN serums and creams for visibly firmer, smoother-looking skin.",
  /** USD. TBC with client. */
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 75),
  /** Fallback announcement lines until an `announcement` metaobject exists. */
  announcements: [
    `Complimentary US shipping on orders over $${process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 75}`,
    "Secure checkout with Shop Pay, Apple Pay & Google Pay",
  ],
  social: {
    instagram: "", // TBC
    tiktok: "", // TBC
    facebook: "", // TBC
  },
  contactEmail: "", // TBC
  /** TBC: confirm fulfilment times with client. */
  dispatchText: "Orders placed before 1pm ET ship the same business day.",
  /** TBC: confirm returns window with client. */
  returnsText: "Unopened products may be returned within 30 days of delivery.",
} as const;

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { title: string; links: NavLink[] };
export type NavItem = {
  label: string;
  href: string;
  mega?: { groups: NavGroup[]; feature?: { eyebrow: string; title: string; href: string; image: string } };
};

/**
 * Primary navigation. Collection handles match CLAUDE.md §5 — create these in
 * Shopify admin. TBC: move to a Shopify menu (`main-menu`) once content is final.
 */
export const mainNav: NavItem[] = [
  {
    label: "Shop",
    href: "/collections/shop-all",
    mega: {
      groups: [
        {
          title: "Category",
          links: [
            { label: "Shop All", href: "/collections/shop-all" },
            { label: "Serums", href: "/collections/serums" },
            { label: "Creams & Moisturizers", href: "/collections/creams-moisturizers" },
            { label: "Sets & Rituals", href: "/collections/sets" },
            { label: "Accessories", href: "/collections/accessories" },
          ],
        },
        {
          title: "Discover",
          links: [
            { label: "Bestsellers", href: "/collections/bestsellers" },
            { label: "New Arrivals", href: "/collections/new" },
          ],
        },
      ],
      feature: {
        eyebrow: "Featured",
        title: "NAD+ PDRN Serum",
        href: "/collections/serums",
        image: "/placeholder/nad-pdrn-serum.jpg",
      },
    },
  },
  {
    label: "Concerns",
    href: "/collections/shop-all",
    mega: {
      groups: [
        {
          title: "Shop by concern",
          links: [
            { label: "Fine Lines & Wrinkles", href: "/collections/anti-wrinkle" },
            { label: "Firmness", href: "/collections/firming" },
            { label: "Texture", href: "/collections/texture" },
            { label: "Dullness", href: "/collections/radiance" },
            { label: "Hydration", href: "/collections/hydration" },
          ],
        },
      ],
      feature: {
        eyebrow: "Concern",
        title: "The Firming Edit",
        href: "/collections/firming",
        image: "/placeholder/firming-cream.jpg",
      },
    },
  },
  { label: "Sets", href: "/collections/sets" },
  { label: "Science", href: "/pages/science" },
  { label: "About", href: "/pages/about" },
];

export const footerNav: NavGroup[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/collections/shop-all" },
      { label: "Serums", href: "/collections/serums" },
      { label: "Creams", href: "/collections/creams-moisturizers" },
      { label: "Sets", href: "/collections/sets" },
      { label: "Accessories", href: "/collections/accessories" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "The Science", href: "/pages/science" },
      { label: "Our Story", href: "/pages/about" },
      { label: "Journal", href: "/blogs/journal" },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "Help & FAQ", href: "/pages/faq" },
      { label: "Shipping", href: "/policies/shipping-policy" },
      { label: "Returns", href: "/policies/refund-policy" },
      { label: "Contact", href: "/pages/contact" },
      { label: "Accessibility", href: "/pages/accessibility" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Privacy", href: "/policies/privacy-policy" },
  { label: "Terms", href: "/policies/terms-of-service" },
];
