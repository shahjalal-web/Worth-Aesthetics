/**
 * Fallback editorial copy for bespoke pages. Shopify content (pages,
 * metaobjects) overrides these where noted. All claims are kept within US
 * cosmetic language ("look of", "appearance", "visibly") — see CLAUDE.md §9.
 */
import type { FaqItem, Ingredient } from "@/lib/shopify/types";
import { siteConfig } from "@/lib/site-config";

export const fallbackIngredients: Ingredient[] = [
  {
    name: "Snap-8",
    inci: "Acetyl Octapeptide-3",
    description:
      "An eight-amino-acid signal peptide, an extended cousin of the classic hexapeptide, chosen to help soften the look of expression lines around the eyes and forehead.",
    image: null,
  },
  {
    name: "GHK-Cu",
    inci: "Copper Tripeptide-1",
    description:
      "A naturally occurring tripeptide bound to copper. Prized in skincare for supporting the look of firm, resilient and even-toned skin.",
    image: null,
  },
  {
    name: "NAD+",
    inci: "Nicotinamide Adenine Dinucleotide",
    description:
      "A coenzyme found in every living cell. In skincare it is included to help skin look energised, revitalised and luminous.",
    image: null,
  },
  {
    name: "PDRN",
    inci: "Polydeoxyribonucleotide",
    description:
      "DNA fragments celebrated in Korean skincare for a smoother, bouncier-looking complexion with a healthy glow.",
    image: null,
  },
  {
    name: "Hyaluronic Acid",
    inci: "Sodium Hyaluronate",
    description:
      "A humectant that attracts and binds water at the surface, leaving skin feeling plumped, supple and deeply hydrated.",
    image: null,
  },
  {
    name: "Palmitoyl Tripeptide-1",
    inci: "Palmitoyl Tripeptide-1",
    description:
      "A lipid-linked signal peptide included to help skin look smoother and more refined.",
    image: null,
  },
  {
    name: "Palmitoyl Tetrapeptide-7",
    inci: "Palmitoyl Tetrapeptide-7",
    description: "A four-amino-acid peptide that helps calm the look of dullness and uneven texture.",
    image: null,
  },
  {
    name: "Niacinamide",
    inci: "Niacinamide",
    description:
      "Vitamin B3 — a versatile, well-tolerated active that helps refine the look of pores and even out skin tone.",
    image: null,
  },
];

export const fallbackFaq: FaqItem[] = [
  // Orders & shipping
  {
    category: "Orders & Shipping",
    question: "Do you offer free shipping?",
    answer: `Yes — US orders over $${siteConfig.freeShippingThreshold} ship complimentary. The exact shipping cost for smaller orders is shown at checkout before you pay.`,
  },
  {
    category: "Orders & Shipping",
    question: "When will my order ship?",
    answer: `${siteConfig.dispatchText} You'll receive a confirmation email with tracking as soon as your parcel leaves us.`,
  },
  {
    category: "Orders & Shipping",
    question: "Which payment methods do you accept?",
    answer:
      "We accept all major credit cards, Shop Pay (including pay-in-installments), Apple Pay, Google Pay and PayPal. Checkout is securely hosted by Shopify.",
  },
  {
    category: "Orders & Shipping",
    question: "Can I change or cancel my order?",
    answer:
      "Please contact us as soon as possible. We can usually amend or cancel orders that have not yet been prepared for dispatch.",
  },
  // Returns
  {
    category: "Returns",
    question: "What is your returns policy?",
    answer: `${siteConfig.returnsText} Full details are in our returns policy.`,
  },
  // Products & usage
  {
    category: "Products & Usage",
    question: "How do I layer my Worth Aesthetics products?",
    answer:
      "Apply from thinnest to richest: cleanse, then press 3–5 drops of serum into face and neck, and finish with a spatula-measured layer of cream. Use morning and evening, and follow with SPF in the morning.",
  },
  {
    category: "Products & Usage",
    question: "Can I use peptides with retinol or vitamin C?",
    answer:
      "Peptides are generally easy to pair. Many people use vitamin C in the morning and retinoids at night alongside their peptide serum. If your skin is sensitive, introduce one new product at a time.",
  },
  {
    category: "Products & Usage",
    question: "Are your products suitable for sensitive skin?",
    answer:
      "Our formulas are designed to be gentle, but everyone's skin is different. We always recommend a patch test on the inner arm 24 hours before first use. Discontinue use if redness or irritation occurs.",
  },
  {
    category: "Products & Usage",
    question: "How long does a bottle last?",
    answer:
      "Used morning and evening as directed, a 30 ml serum typically lasts around six to eight weeks. Once opened, use within 12 months.",
  },
  {
    category: "Products & Usage",
    question: "When will I see results?",
    answer:
      "Skin renews itself gradually. Most people notice skin feeling more hydrated straight away, with smoother, firmer-looking skin building over several weeks of consistent use.",
  },
  // Account
  {
    category: "Account",
    question: "Do I need an account to order?",
    answer:
      "No — you can check out as a guest. Creating an account lets you view your order history and speed through checkout next time.",
  },
];

export const sciencePillars = [
  {
    n: "01",
    title: "Signal peptides",
    sub: "The messengers",
    text: "Short chains of amino acids that act as messages at the skin's surface. Formulas built around them help skin look smoother, firmer and more refined.",
  },
  {
    n: "02",
    title: "Carrier peptides",
    sub: "The escorts",
    text: "Peptides such as GHK-Cu bind trace elements like copper. They're prized for supporting the look of resilient, even-toned skin.",
  },
  {
    n: "03",
    title: "Expression-line peptides",
    sub: "The softeners",
    text: "Peptides such as Snap-8 are chosen to help soften the look of lines formed by everyday expression — around the eyes and across the forehead.",
  },
];

export const formulationPrinciples = [
  {
    title: "Multi-peptide chains",
    text: "Rather than a single hero, each formula pairs complementary peptides that are chosen to work together.",
  },
  {
    title: "Protective packaging",
    text: "Airless pumps and heavy frosted glass help shield sensitive actives from light and air, so the last drop is as considered as the first.",
  },
  {
    title: "Precision, not excess",
    text: "Every ingredient earns its place. No filler actives for label appeal — only what serves the formula.",
  },
  {
    title: "Honest claims",
    text: "We describe what our products do for the look and feel of skin, and we never overstate it.",
  },
];

export const aboutPrinciples = [
  {
    title: "Clinical precision",
    text: "Advanced multi-peptide chains, biomimetic peptides and cellular signalling complexes, formulated with rigour.",
  },
  {
    title: "Understated luxury",
    text: "Champagne-toned metal, acid-etched frosted glass and soft-touch cartons — a ritual that feels as good as it looks.",
  },
  {
    title: "Considered craftsmanship",
    text: "From the weight of a jar to the click of a dropper, every physical touchpoint is specified with care.",
  },
];
