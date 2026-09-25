# CLAUDE.md — Worth Aesthetics Headless Storefront

You are building the production e-commerce website for **Worth Aesthetics**, a premium peptide skincare brand (US market). Shopify is the commerce backend; the storefront is a fully custom **Next.js** app. The client's top priority is a **premium experience with high conversion and low cart abandonment**.

Read this whole file before writing code. When something here is marked **TBC**, do not invent it — use a clearly marked placeholder and add it to `docs/OPEN_QUESTIONS.md`.

---

## 1. Tech stack (non-negotiable unless I say otherwise)

- **Next.js** (latest stable, App Router, React Server Components), **TypeScript** strict mode
- **Tailwind CSS** with design tokens from Section 3 in `tailwind.config` / CSS variables
- **Shopify Storefront API** (GraphQL). Pin the API version in one constant (`lib/shopify/constants.ts`); check Shopify's docs for the latest stable version before starting.
- Cart via Storefront API `cart` mutations; cart ID in an httpOnly cookie. **Checkout = redirect to `cart.checkoutUrl`** (Shopify-hosted checkout). Do not build a custom checkout.
- Customer accounts via the **Customer Account API** (OAuth/PKCE), not the legacy customer access token flow.
- **Shopify Admin API** only in local scripts under `/scripts` (never shipped to the browser, never in client components).
- Deploy target: **Vercel**. Use ISR/tag-based revalidation + Shopify webhooks (`/api/revalidate`, HMAC-verified) so product/collection edits in Shopify show up without redeploy.
- Images: `next/image` with `cdn.shopify.com` as remote pattern; use Shopify image transforms for sizes.
- Fonts: `next/font` (self-hosted, no layout shift).
- Forms/validation: `zod`. No heavy UI kits; build components in-house to keep the luxury look and small bundle.
- Reference architecture: Vercel's open-source "Next.js Commerce" is a good pattern reference for Shopify data fetching, cart and revalidation. Use it as a reference, not a copy — the UI must be fully custom.

### Environment variables (`.env.example`, never commit real values)
```
SHOPIFY_STORE_DOMAIN=            # xxx.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN= # from Headless channel
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=# server-side only
SHOPIFY_API_VERSION=
SHOPIFY_REVALIDATION_SECRET=     # webhook HMAC secret
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_API_URL=
SHOPIFY_ADMIN_ACCESS_TOKEN=      # scripts only, never in app runtime
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=
KLAVIYO_PUBLIC_KEY=              # TBC — only if client uses Klaviyo
```

---

## 2. Reference & positioning

- **Reference site (layout/UX, not visuals):** https://oseamalibu.com/collections/shop
  Borrow these patterns: slide-out cart drawer with free-shipping progress bar, "Add to bag" directly on product cards, variant/size pills on cards, star ratings on cards, badges (New / Bestseller / Save X%), filters (skin concern, category, skin type) + sort, sets/bundles with strike-through pricing, "Recently viewed" + "Trending" rails, collection-bottom SEO FAQ, trust strip (guarantee, cruelty-free etc.), email signup offer in footer, mega menu.
- **Our visual identity is different:** OSEA is ocean/pastel. Worth Aesthetics is **clinical peptide science + understated luxury** — champagne taupe, alabaster, charcoal, lots of white space, serif italic accents, precise thin lines. Think "clinic meets luxury maison".

---

## 3. Brand system (from client's Packaging & Brand Style Guide v2.4)

### Colors → CSS variables
| Token | Name | HEX | Web use |
|---|---|---|---|
| `--wa-taupe` | Champagne Taupe (Pantone 7503 C) | `#B89F6B` | Accents, primary buttons, dividers, active states, links on hover |
| `--wa-white` | Pristine White | `#FFFFFF` | Base background, cards |
| `--wa-charcoal` | Matte Charcoal (Pantone Black 7 C) | `#2D2B2A` | Body text, headings, footer background |
| `--wa-alabaster` | Alabaster Mist (Pantone 7527 C) | `#EFE9E0` | Section backgrounds, cart drawer, input fields |

Derive tints/shades (e.g. `taupe-600` for hover) but keep the palette tight. **Accessibility rule from the brand guide applies on web too:** never put small white text on taupe/gold. Buttons with taupe background must use charcoal text, or darken the taupe until white text meets WCAG AA (4.5:1). Check contrast for every text/background pair.

### Typography
| Role | Brand guide | Web font |
|---|---|---|
| Wordmark / nav / buttons / eyebrow labels | Montserrat, Medium–Bold, ALL CAPS, wide tracking (+150) | Montserrat (Google) — `tracking-[0.15em] uppercase` |
| Product titles, headings | Helvetica Neue / Neue Haas Grotesk, Light–Regular, ALL CAPS, +80 tracking | **TBC**: use licensed Neue Haas if client provides a web license; otherwise Inter (Light/Regular) as substitute |
| Peptide complex sublines, editorial accents | Cormorant Garamond, Regular Italic, Title Case | Cormorant Garamond Italic (Google) |
| Body / INCI / small print | Helvetica Neue / Univers | Same sans as product titles, regular |

Example product card hierarchy: `SNAP-8 + GHK-CU FACE SERUM` (sans, light, caps, tracked) → *Copper Tripeptide-1 + Acetyl Octapeptide-3* (Cormorant italic) → `30 ML / 1.0 FL. OZ.` (small caps label) → price → Add to bag.

### Logo
- WA monogram roundel + WORTH AESTHETICS wordmark (molecular node icon inside the "O").
- **TBC:** need SVG vector logo from client. Until then use a text placeholder `components/brand/Logo.tsx` — do not trace or redraw the logo from photos.

### Visual language
- Generous whitespace, thin 1px taupe hairlines, restrained motion (fade/translate ≤ 300ms, respect `prefers-reduced-motion`).
- Subtle "molecular node" motif (small connected dots/lines) may be used sparingly as a decorative SVG in section dividers — keep it minimal.
- Photography: product on white / alabaster, soft natural light, marble & travertine surfaces (matches client's mockups).

---

## 4. Known products (seed data — prices, copy, INCI all TBC)

| Working name | Format | Size | Notes |
|---|---|---|---|
| Snap-8 + GHK-Cu Face Serum | Dropper bottle | 30 ml / 1 fl oz | Claims on label: Anti-wrinkle, Firming, Deep repair |
| NAD+ PDRN Serum | Airless pump + carton | 50 ml / 1.75 fl oz | |
| GHK-Cu Snap-8 Anti-Wrinkle Firming Cream | Jar | 50 g | Snap-8, collagen-boosting peptides, hyaluronic acid |
| Black jar product with spatula | Jar | TBC | Product type TBC (ask client) |
| Worth Aesthetics leather pouch | Accessory | — | Gift-with-purchase or accessory — TBC |

Style-guide example names also exist (e.g. "Signal Peptide Recovery", "Cellular Renewal Cream") — treat as possible future SKUs, not live products.

Product photos provided are mostly mockups; build so final photography can be swapped in via Shopify only.

---

## 5. Shopify data model (the storefront must read all content from Shopify)

### Product metafields (namespace `wa`) — create definitions via `/scripts/setup-metafields.ts`
| Key | Type | Used for |
|---|---|---|
| `subtitle` | single_line_text | Short card tagline ("Wrinkle-smoothing peptide serum") |
| `active_complex` | single_line_text | Italic subline, e.g. "Copper Tripeptide-1 + Snap-8" |
| `key_ingredients` | list.metaobject_reference → `ingredient` | PDP ingredient spotlight |
| `benefits` | list.single_line_text | Bullet benefits on PDP |
| `how_to_use` | rich_text | PDP accordion |
| `full_ingredients_inci` | multi_line_text | PDP accordion |
| `skin_concerns` | list.single_line_text | Filters (Wrinkles, Firmness, Texture, Dullness, Hydration…) |
| `skin_types` | list.single_line_text | Filters |
| `routine_step` | single_line_text | AM/PM routine ordering |
| `size_label` | single_line_text | "30 ML / 1.0 FL. OZ." |
| `badge` | single_line_text | New / Bestseller / Limited |
| `pairs_well_with` | list.product_reference | Cross-sell on PDP & cart |
| `results_claims` | list.single_line_text | Only substantiated claims — TBC with client |
| `faq` | list.metaobject_reference → `faq_item` | PDP FAQ |

### Metaobjects
- `ingredient` (name, short_description, image)
- `faq_item` (question, answer)
- `homepage_section` / `hero_slide` (headline, subline, image, cta_label, cta_link) — so the client can edit homepage content in Shopify admin
- `press_logo` / `testimonial` (optional)

### Collections (create in Shopify, storefront reads by handle)
`shop-all`, `serums`, `creams-moisturizers`, `sets`, `bestsellers`, `new`, `accessories` — plus concern-based smart collections (e.g. `anti-wrinkle`, `firming`).

Use Storefront API **search & filter** (`collection.products(filters:…)`) for filtering, driven by metafields exposed via the Shopify **Search & Discovery** app filters.

---

## 6. Pages & features (scope)

### Global
- Announcement bar (text from Shopify metaobject), sticky header with mega menu (Shop / Concerns / Sets / Science / About), search (predictive search API), account icon, bag icon with count.
- **Cart drawer** (primary conversion element):
  - Free-shipping progress bar (threshold configurable — TBC amount)
  - Line items with qty stepper, remove, variant label
  - "Pairs well with" upsell (from `pairs_well_with` or Shopify product recommendations API)
  - Optional order note / gift note
  - Discount code field is at checkout (Shopify), don't duplicate
  - Trust row (secure checkout, guarantee, payment icons)
  - Big "Checkout" button → `checkoutUrl`; optimistic UI updates
- Footer: email signup (Klaviyo or Shopify customer marketing — TBC), links, social, policies.
- Cookie/consent banner wired to Shopify **Customer Privacy API** (US state privacy laws); analytics fire only per consent.

### Home
Hero (full-bleed, product-led), bestsellers rail with quick add, "The Science" peptide explainer band, featured set/bundle, ingredient spotlight, before/after or clinical results block (only with substantiated data — TBC), reviews carousel, UGC/Instagram strip (optional), press logos (optional), email capture.

### Collection / Shop All (PLP)
Grid with product cards (image swap on hover, badge, rating, subtitle, price/compare-at, size pills, "Add to bag"), filters (concern, category, skin type, price), sort, pagination or "Load more", SEO intro + FAQ at bottom, "Recently viewed" rail.

### Product (PDP)
Gallery (zoom, swipe on mobile, video support), title + italic active complex + size, rating summary (anchor to reviews), price, variant selector, qty, **Add to bag + sticky add-to-bag bar on mobile**, Shop Pay / express checkout messaging, delivery estimate text, benefits, accordions (How to use, Key ingredients, Full INCI, Shipping & returns), ingredient spotlight, "Complete your routine" cross-sell, reviews section, FAQ, JSON-LD `Product` + `AggregateRating` + `BreadcrumbList`.

### Other pages
- The Science / Our Peptides (education page — important for trust and SEO)
- About / Our Story
- Sets & Bundles
- Build Your Routine quiz — **Phase 2, only if client confirms**
- Contact, FAQ / Help center, Shipping, Returns, Privacy, Terms, Accessibility statement (policy text from Shopify `shop.privacyPolicy` etc.)
- Blog/Journal via Shopify Blog (list + article pages)
- 404 and empty-cart states with product suggestions
- Account: login/logout via Customer Account API, order history, addresses

### Integrations (confirm with me before adding each)
- Reviews: Judge.me or Okendo (must support headless via API/widget) — TBC
- Email/SMS: Klaviyo (signup forms, abandoned-cart flows, `Viewed Product` / `Added to Cart` events) — TBC
- Subscriptions (Subscribe & Save): **Phase 2**, needs a subscriptions app with headless support
- Analytics: GA4 + Meta Pixel + Shopify Analytics (use `@shopify/hydrogen-react` analytics helpers for `PAGE_VIEW` / `ADD_TO_CART` so Shopify admin reports work in headless)

---

## 7. Conversion & abandonment requirements (client's stated priority)

- Performance budget: LCP < 2.0s on 4G mobile, CLS < 0.05, INP < 200ms. Lighthouse mobile ≥ 90 on Home, PLP, PDP.
- Minimal client JS; server components by default; client components only for interactivity.
- Add-to-bag in ≤ 1 tap from cards and PDP; cart drawer opens instantly (optimistic).
- Cart persists across sessions (cookie) and survives login.
- Clear price, shipping threshold and returns policy visible **before** checkout (surprise costs are the #1 abandonment reason).
- Express checkout awareness (Shop Pay, Apple Pay, Google Pay, PayPal — enabled in Shopify).
- Trust signals near every buy button: guarantee, secure checkout, cruelty-free (only if true — TBC).
- Abandoned checkout recovery is handled by Shopify/Klaviyo emails — make sure customer email capture & consent flows pass data correctly.
- Every add-to-cart, begin-checkout and view-item event tracked in GA4 with standard e-commerce schema.

---

## 8. SEO & accessibility

- Metadata API per route, canonical URLs, Open Graph images, `sitemap.xml` and `robots.txt` generated from Shopify data.
- JSON-LD: Organization, Product, BreadcrumbList, FAQPage (where FAQ shown).
- Clean URLs matching Shopify handles: `/products/[handle]`, `/collections/[handle]`, `/pages/[handle]`, `/blogs/[blog]/[article]`.
- WCAG 2.2 AA: keyboard nav, focus states in taupe, alt text from Shopify, aria on drawer/modals, focus trap in drawer.

---

## 9. Copy & compliance guardrails

This is a **cosmetic** brand selling in the US. Keep all marketing copy within cosmetic claims:
- OK: "visibly reduces the look of fine lines", "firmer-looking skin", "supports skin's appearance", "hydrates".
- NOT OK: "heals", "treats", "repairs DNA", "stimulates collagen production" (as a physiological claim), "medical-grade" unless client substantiates, any disease claims.
- Never invent clinical percentages, reviews, press mentions or certifications (e.g. Leaping Bunny appears in the brand guide — confirm before displaying). Use placeholders marked TBC.

---

## 10. Project structure (suggested)

```
app/
  (store)/page.tsx, collections/[handle], products/[handle], pages/[handle], blogs/...
  account/..., api/revalidate/route.ts, api/cart/...
components/ brand/, layout/, product/, collection/, cart/, ui/
lib/ shopify/ (client.ts, queries/, mutations/, fragments/, types.ts), analytics/, seo/
scripts/ setup-metafields.ts, seed-products.ts (Admin API, dry-run flag)
docs/ OPEN_QUESTIONS.md, SHOPIFY_SETUP.md, DEPLOY.md
```

Use GraphQL codegen (`@graphql-codegen` with Shopify's schema) for typed queries.

---

## 11. How to work with me

1. **Phase 0 — Plan:** Propose the file structure, dependency list and a phased task list. Wait for my OK.
2. **Phase 1 — Foundation:** Next.js setup, tokens, fonts, layout shell, Shopify client, typed queries, `.env.example`.
3. **Phase 2 — Commerce core:** PLP, PDP, cart drawer, checkout redirect, search, revalidation webhook.
4. **Phase 3 — Content & brand pages:** Home, Science, About, policies, blog, metaobject-driven sections.
5. **Phase 4 — Accounts, analytics, consent, SEO, JSON-LD.**
6. **Phase 5 — Polish:** motion, accessibility audit, Lighthouse, cross-browser/mobile QA.
7. **Scripts:** `setup-metafields.ts` and `seed-products.ts` must support `--dry-run`, be idempotent (no duplicates on re-run), and log every change. Never delete Shopify data. Ask before running anything against the live store.

Rules:
- Commit in small, descriptive commits per feature.
- Never commit secrets; never expose private/admin tokens to the client bundle.
- If the Shopify store is missing data you need, tell me exactly what to create in Shopify admin instead of hardcoding it.
- After each phase, summarize what's done, what's left and any TBC items.

## 12. Definition of done
- All pages render with real Shopify data; editing a product in Shopify updates the site within a minute.
- Full purchase flow works end to end (add → drawer → Shopify checkout → order confirmation → order visible in account).
- Lighthouse mobile ≥ 90 on key pages, no console errors, no a11y violations in axe.
- `docs/SHOPIFY_SETUP.md` and `docs/DEPLOY.md` written so the client can maintain the site.
