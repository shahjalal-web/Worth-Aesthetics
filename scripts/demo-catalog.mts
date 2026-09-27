/**
 * DEMO catalogue — placeholder products so every collection has depth while the
 * client finalises the real range. Everything here is tagged `demo` + `tbc`
 * (easy to find and archive later in Shopify admin: Products → filter tag "demo").
 * Copy stays within cosmetic claims (CLAUDE.md §9). Prices are placeholders.
 */
import type { Shape } from "./generate-placeholder-images.mts";

export type DemoVariant = { size: string; price: string; compareAt?: string };
export type DemoProduct = {
  handle: string;
  title: string;
  productType: "Serum" | "Cream" | "Set" | "Accessory" | "Cleanser";
  tags: string[];
  variants: DemoVariant[];
  shape: Shape;
  tone: string;
  descriptionHtml: string;
  meta: Record<string, string | string[] | undefined>;
  ingredients?: string[];
};

const p = (t: string) => `<p>${t}</p>`;

const hydra: Shape = { kind: "dropper", glass: "frost", cap: "gold", line: "Hyaluronic Peptide Serum", size: "30 ML / 1.0 FL. OZ." };
const radiance: Shape = { kind: "dropper", glass: "amber", cap: "gold", line: "Radiance Peptide Serum", size: "30 ML / 1.0 FL. OZ." };
const signal: Shape = { kind: "airless", glass: "champagne", cap: "gold", line: "Signal Peptide Recovery", size: "50 ML / 1.75 FL. OZ." };
const eyeSerum: Shape = { kind: "airless", glass: "white", cap: "silver", line: "Eye Contour Serum", size: "15 ML / 0.5 FL. OZ.", slim: true };
const renewal: Shape = { kind: "jar", glass: "white", cap: "gold", line: "Cellular Renewal", size: "50 G / 1.7 OZ." };
const barrier: Shape = { kind: "jar", glass: "champagne", cap: "gold", line: "Barrier Cream", size: "50 G / 1.7 OZ." };
const mask: Shape = { kind: "jar", glass: "black", cap: "black", line: "Overnight Mask", size: "75 G / 2.6 OZ." };
const eyeCream: Shape = { kind: "tube", glass: "white", cap: "gold", line: "Peptide Eye Cream", size: "15 ML / 0.5 FL. OZ.", small: true };
const cleanser: Shape = { kind: "tube", glass: "frost", cap: "silver", line: "Peptide Gel Cleanser", size: "150 ML / 5.0 FL. OZ." };
const snap: Shape = { kind: "dropper", glass: "amber", cap: "gold", line: "Snap-8 GHK-Cu Serum", size: "30 ML / 1.0 FL. OZ." };
const nad: Shape = { kind: "airless", glass: "champagne", cap: "silver", line: "NAD+ PDRN Serum", size: "50 ML / 1.75 FL. OZ." };
const firming: Shape = { kind: "jar", glass: "black", cap: "gold", line: "Firming Cream", size: "50 G / 1.7 OZ." };

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ── Serums ─────────────────────────────────────────────
  {
    handle: "hyaluronic-peptide-hydration-serum",
    title: "Hyaluronic Peptide Hydration Serum",
    productType: "Serum",
    tags: ["new", "concern:hydration", "concern:texture"],
    variants: [{ size: "15 ml", price: "42.00" }, { size: "30 ml", price: "64.00" }],
    shape: hydra,
    tone: "#efe7da",
    descriptionHtml: p("A weightless, water-light serum layering multi-weight hyaluronic acid with a soothing peptide. Skin feels instantly plumped, supple and comfortable."),
    meta: {
      subtitle: "Multi-weight hydration serum",
      active_complex: "Hyaluronic Acid + Palmitoyl Tripeptide-1",
      badge: "New",
      routine_step: "2",
      benefits: ["Instant, lasting hydration", "Plumper, smoother-looking skin", "Layers under any cream"],
      skin_concerns: ["Hydration", "Texture"],
      skin_types: ["All skin types", "Dry", "Sensitive"],
    },
    ingredients: ["hyaluronic-acid", "palmitoyl-tripeptide-1"],
  },
  {
    handle: "radiance-peptide-serum",
    title: "Radiance Peptide Serum",
    productType: "Serum",
    tags: ["bestseller", "concern:dullness", "concern:texture"],
    variants: [{ size: "30 ml", price: "66.00" }],
    shape: radiance,
    tone: "#f0e4d2",
    descriptionHtml: p("A luminous daily serum pairing niacinamide with a brightening peptide blend for a more even, radiant-looking complexion."),
    meta: {
      subtitle: "Brightening daily serum",
      active_complex: "Niacinamide + Palmitoyl Tetrapeptide-7",
      size_label: "30 ML / 1.0 FL. OZ.",
      badge: "Bestseller",
      routine_step: "2",
      benefits: ["Visibly brighter, more even-looking tone", "Refined-looking pores", "Silky, fast-absorbing finish"],
      skin_concerns: ["Dullness", "Texture"],
      skin_types: ["All skin types", "Oily", "Combination"],
    },
    ingredients: ["niacinamide", "palmitoyl-tetrapeptide-7"],
  },
  {
    handle: "signal-peptide-recovery-serum",
    title: "Signal Peptide Recovery Serum",
    productType: "Serum",
    tags: ["new", "concern:firmness", "concern:wrinkles"],
    variants: [{ size: "50 ml", price: "94.00" }],
    shape: signal,
    tone: "#ece3d3",
    descriptionHtml: p("Our most concentrated signal-peptide complex in a protective airless pump. Helps skin look firmer, smoother and more resilient after every use."),
    meta: {
      subtitle: "Concentrated signal-peptide serum",
      active_complex: "Palmitoyl Tripeptide-1 + Snap-8 + GHK-Cu",
      size_label: "50 ML / 1.75 FL. OZ.",
      badge: "New",
      routine_step: "2",
      benefits: ["Helps skin look firmer and more resilient", "Softens the look of fine lines", "Airless pump protects the formula"],
      skin_concerns: ["Firmness", "Wrinkles"],
      skin_types: ["All skin types"],
    },
    ingredients: ["palmitoyl-tripeptide-1", "snap-8", "ghk-cu"],
  },
  {
    handle: "peptide-eye-contour-serum",
    title: "Peptide Eye Contour Serum",
    productType: "Serum",
    tags: ["concern:wrinkles", "concern:hydration"],
    variants: [{ size: "15 ml", price: "58.00" }],
    shape: eyeSerum,
    tone: "#eee8df",
    descriptionHtml: p("A cooling, targeted serum for the delicate eye area. Helps smooth the look of crow’s feet and leaves the contour looking refreshed."),
    meta: {
      subtitle: "Targeted eye-area serum",
      active_complex: "Snap-8 + Hyaluronic Acid",
      size_label: "15 ML / 0.5 FL. OZ.",
      routine_step: "2",
      benefits: ["Smoother-looking eye contour", "Refreshed, rested appearance", "Cooling metal-tip applicator"],
      skin_concerns: ["Wrinkles", "Hydration"],
      skin_types: ["All skin types", "Sensitive"],
    },
    ingredients: ["snap-8", "hyaluronic-acid"],
  },
  // ── Creams ─────────────────────────────────────────────
  {
    handle: "cellular-renewal-cream",
    title: "Cellular Renewal Cream",
    productType: "Cream",
    tags: ["bestseller", "concern:texture", "concern:firmness"],
    variants: [{ size: "30 g", price: "62.00" }, { size: "50 g", price: "84.00" }],
    shape: renewal,
    tone: "#f1e9dc",
    descriptionHtml: p("A velvety renewal cream with NAD+ and peptides that leaves skin looking smoother, more refined and quietly radiant by morning."),
    meta: {
      subtitle: "Smoothing renewal cream",
      active_complex: "NAD+ + Palmitoyl Tripeptide-1",
      badge: "Bestseller",
      routine_step: "3",
      benefits: ["Smoother, more refined-looking texture", "Firmer-looking skin", "Velvety, comforting finish"],
      skin_concerns: ["Texture", "Firmness"],
      skin_types: ["Normal", "Dry", "Combination"],
    },
    ingredients: ["nad", "palmitoyl-tripeptide-1"],
  },
  {
    handle: "ceramide-peptide-barrier-cream",
    title: "Ceramide Peptide Barrier Cream",
    productType: "Cream",
    tags: ["concern:hydration"],
    variants: [{ size: "50 g", price: "62.00" }],
    shape: barrier,
    tone: "#efe4d1",
    descriptionHtml: p("A cocooning moisturiser that helps reinforce skin’s moisture barrier, leaving it soft, calm and comfortable all day."),
    meta: {
      subtitle: "Moisture-barrier moisturiser",
      active_complex: "Ceramides + Palmitoyl Tetrapeptide-7",
      size_label: "50 G / 1.7 OZ.",
      routine_step: "3",
      benefits: ["Helps support the moisture barrier", "Soft, comfortable skin all day", "Fragrance-free formula"],
      skin_concerns: ["Hydration"],
      skin_types: ["Dry", "Sensitive"],
    },
    ingredients: ["palmitoyl-tetrapeptide-7", "hyaluronic-acid"],
  },
  {
    handle: "overnight-peptide-sleeping-mask",
    title: "Overnight Peptide Sleeping Mask",
    productType: "Cream",
    tags: ["new", "concern:hydration", "concern:dullness"],
    variants: [{ size: "75 g", price: "72.00" }],
    shape: mask,
    tone: "#ece5da",
    descriptionHtml: p("A cushioning leave-on mask that works while you sleep. Wake to skin that looks rested, bouncy and luminous."),
    meta: {
      subtitle: "Leave-on overnight mask",
      active_complex: "PDRN + Hyaluronic Acid",
      size_label: "75 G / 2.6 OZ.",
      badge: "New",
      routine_step: "4",
      benefits: ["Rested, luminous-looking skin by morning", "Deep overnight hydration", "Cushioning gel-cream texture"],
      skin_concerns: ["Hydration", "Dullness"],
      skin_types: ["All skin types"],
    },
    ingredients: ["pdrn", "hyaluronic-acid"],
  },
  {
    handle: "peptide-eye-cream",
    title: "Peptide Eye Cream",
    productType: "Cream",
    tags: ["concern:wrinkles", "concern:firmness"],
    variants: [{ size: "15 ml", price: "54.00" }],
    shape: eyeCream,
    tone: "#f2ebe0",
    descriptionHtml: p("A rich yet silky eye cream that helps the eye area look firmer and smoother. Perfect for morning and evening."),
    meta: {
      subtitle: "Firming eye cream",
      active_complex: "GHK-Cu + Palmitoyl Tetrapeptide-7",
      size_label: "15 ML / 0.5 FL. OZ.",
      routine_step: "3",
      benefits: ["Firmer, smoother-looking eye area", "Helps soften the look of fine lines", "Wears beautifully under makeup"],
      skin_concerns: ["Wrinkles", "Firmness"],
      skin_types: ["All skin types"],
    },
    ingredients: ["ghk-cu", "palmitoyl-tetrapeptide-7"],
  },
  // ── Cleanser ───────────────────────────────────────────
  {
    handle: "peptide-gel-cleanser",
    title: "Peptide Gel Cleanser",
    productType: "Cleanser",
    tags: ["concern:texture", "concern:hydration"],
    variants: [{ size: "150 ml", price: "36.00" }],
    shape: cleanser,
    tone: "#eee7dc",
    descriptionHtml: p("A gentle, low-foam gel that lifts away impurities without stripping, leaving skin clean, soft and ready for serum."),
    meta: {
      subtitle: "Gentle daily gel cleanser",
      active_complex: "Amino-Acid Cleansers + Peptides",
      size_label: "150 ML / 5.0 FL. OZ.",
      routine_step: "1",
      benefits: ["Cleans without tightness", "Soft, balanced-feeling skin", "Gentle enough for twice daily"],
      skin_concerns: ["Texture", "Hydration"],
      skin_types: ["All skin types"],
    },
  },
  // ── Sets ───────────────────────────────────────────────
  {
    handle: "the-firming-ritual-set",
    title: "The Firming Ritual",
    productType: "Set",
    tags: ["bestseller", "concern:firmness", "concern:wrinkles"],
    variants: [{ size: "Full size", price: "128.00", compareAt: "146.00" }],
    shape: { kind: "set", items: [snap, firming] },
    tone: "#efe5d4",
    descriptionHtml: p("Our signature pairing: the Snap-8 + GHK-Cu Face Serum and the GHK-Cu Snap-8 Firming Cream, presented together for a complete firming ritual."),
    meta: {
      subtitle: "Serum + cream duo",
      active_complex: "Snap-8 Serum · Firming Cream",
      size_label: "2 FULL-SIZE FORMULAS",
      badge: "Bestseller",
      benefits: ["Two full-size formulas", "Designed to layer", "Presented in a gift box"],
      skin_concerns: ["Firmness", "Wrinkles"],
      skin_types: ["All skin types"],
    },
    ingredients: ["snap-8", "ghk-cu"],
  },
  {
    handle: "the-radiance-duo",
    title: "The Radiance Duo",
    productType: "Set",
    tags: ["concern:dullness", "concern:texture"],
    variants: [{ size: "Full size", price: "136.00", compareAt: "154.00" }],
    shape: { kind: "set", items: [radiance, nad] },
    tone: "#f1e6d5",
    descriptionHtml: p("The Radiance Peptide Serum and NAD+ PDRN Serum, paired for a luminous, revitalised-looking complexion morning and night."),
    meta: {
      subtitle: "AM + PM glow pairing",
      active_complex: "Radiance Serum · NAD+ PDRN Serum",
      size_label: "2 FULL-SIZE FORMULAS",
      benefits: ["Morning + evening pairing", "Two full-size serums", "Presented in a gift box"],
      skin_concerns: ["Dullness", "Texture"],
      skin_types: ["All skin types"],
    },
    ingredients: ["niacinamide", "nad", "pdrn"],
  },
  {
    handle: "the-discovery-set",
    title: "The Discovery Set",
    productType: "Set",
    tags: ["new", "concern:hydration", "concern:wrinkles"],
    variants: [{ size: "Minis", price: "58.00" }],
    shape: { kind: "set", items: [hydra, signal, renewal] },
    tone: "#efe8dc",
    descriptionHtml: p("Three travel-size icons — Hydration Serum, Signal Peptide Recovery Serum and Cellular Renewal Cream — to discover the ritual."),
    meta: {
      subtitle: "Three travel-size icons",
      active_complex: "Hydrate · Recover · Renew",
      size_label: "3 × TRAVEL SIZE",
      badge: "New",
      benefits: ["Three travel sizes", "Ideal introduction to the range", "TSA-friendly sizes"],
      skin_concerns: ["Hydration", "Wrinkles"],
      skin_types: ["All skin types"],
    },
  },
  {
    handle: "the-complete-regimen",
    title: "The Complete Regimen",
    productType: "Set",
    tags: ["concern:firmness", "concern:texture", "concern:hydration"],
    variants: [{ size: "Full size", price: "238.00", compareAt: "270.00" }],
    shape: { kind: "set", items: [cleanser, snap, nad, firming] },
    tone: "#ede4d4",
    descriptionHtml: p("Cleanse, treat and seal: Peptide Gel Cleanser, Snap-8 + GHK-Cu Face Serum, NAD+ PDRN Serum and Firming Cream — the full Worth ritual."),
    meta: {
      subtitle: "The full four-step ritual",
      active_complex: "Cleanse · Treat · Renew · Seal",
      size_label: "4 FULL-SIZE FORMULAS",
      benefits: ["Four full-size formulas", "A complete AM + PM routine", "Presented in a keepsake box"],
      skin_concerns: ["Firmness", "Texture", "Hydration"],
      skin_types: ["All skin types"],
    },
  },
  // ── Accessories ────────────────────────────────────────
  {
    handle: "rose-quartz-sculpting-stone",
    title: "Rose Quartz Sculpting Stone",
    productType: "Accessory",
    tags: [],
    variants: [{ size: "One size", price: "42.00" }],
    shape: { kind: "stone" },
    tone: "#f1e7e2",
    descriptionHtml: p("A hand-polished rose quartz stone for a calming facial massage ritual after serum."),
    meta: { subtitle: "Facial massage stone", active_complex: "Hand-Polished Rose Quartz", size_label: "Accessory" },
  },
  {
    handle: "travertine-vanity-tray",
    title: "Travertine Vanity Tray",
    productType: "Accessory",
    tags: [],
    variants: [{ size: "One size", price: "48.00" }],
    shape: { kind: "tray" },
    tone: "#eee4d4",
    descriptionHtml: p("A honed travertine tray to display your ritual — each piece carries its own natural veining."),
    meta: { subtitle: "Honed stone display tray", active_complex: "Natural Travertine", size_label: "Accessory" },
  },
  {
    handle: "leather-travel-vanity-case",
    title: "Leather Travel Vanity Case",
    productType: "Accessory",
    tags: ["new"],
    variants: [{ size: "One size", price: "58.00" }],
    shape: { kind: "case" },
    tone: "#efe4d6",
    descriptionHtml: p("A structured vanity case in soft tan leather, embossed with the WA monogram, with room for your full routine."),
    meta: { subtitle: "Structured leather case", active_complex: "Embossed WA Monogram", size_label: "Accessory", badge: "New" },
  },
];
