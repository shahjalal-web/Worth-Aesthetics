# Work History — Worth Aesthetics Storefront

> Running log so work can resume after any break. **Update at the end of every session.**
> Newest session on top. Status legend: ✅ done · 🟡 partial · ⏳ next · ⛔ blocked

---

## Resume here (quick start)

```bash
npm install
npm run dev            # http://localhost:3000   (reads .env)
npx next build         # must pass before committing
npx tsx --env-file=.env scripts/validate-queries.mts   # validates all GraphQL vs live API
npx tsx scripts/screenshot.mts http://localhost:3000/ <outDir> light|dark   # visual QA
```

**Next up (in order):**
1. ⛔ **Disable the Online Store password** in Shopify — checkout currently redirects to `/password`.
2. ⛔ **Customer Account API client ID** (Headless channel → Customer Account API) + an https URL (Vercel deploy or ngrok) → account login goes live. Code is done.
3. ⏳ Deploy to Vercel (`docs/DEPLOY.md`), then `scripts/setup-webhooks.mts --url https://…`.
4. ⏳ Search & Discovery filters for `worth.skin_concerns` / `worth.skin_types`.
5. ⏳ Client items from `docs/OPEN_QUESTIONS.md` (logo SVG, real prices/photos, returns, Klaviyo, reviews app).
6. ⏳ Optional: Shopify analytics via `@shopify/hydrogen-react` (`sendShopifyAnalytics`), Lighthouse pass, axe audit.

---

## Session 2 — 2026-09-25 (full site build)

### Shopify (live store — with owner approval)
- ✅ Admin API now works via client-credentials (app installed; scopes: products, metaobjects, content, publications, files…)
- ⚠️ Metafield namespace is **`worth`** (Shopify requires ≥ 3 chars, so CLAUDE.md’s `wa` is impossible)
- ✅ `scripts/setup-metafields.mts` → 5 metaobject definitions (ingredient, faq_item, hero_slide, announcement, testimonial) + 14 `worth.*` product metafields
- ✅ `scripts/seed-content.mts` → 12 smart collections (type/tag rules), Journal blog, 11 FAQ, 8 ingredients, 2 announcements — published to Headless
- ✅ `scripts/seed-products.mts --active` → 4 products with images, metafields, **placeholder prices** ($68/$88/$78/$35, tag `tbc`)
- ✅ `scripts/setup-webhooks.mts` written (needs the public URL)
- Smart-collection rules: type **Serum/Cream/Set/Accessory**; tags **bestseller**, **new**, **concern:wrinkles|firmness|texture|dullness|hydration**

### Pages / features added
- ✅ /pages/science, /about, /ingredients, /faq (+FAQPage JSON-LD), /contact (Resend, TBC), /accessibility, /routine (quiz → batch add to bag)
- ✅ /blogs/[blog] + /blogs/[blog]/[article] (Article JSON-LD, shop-the-story)
- ✅ Customer accounts: OAuth+PKCE (`/account/login|authorize|logout`), encrypted session cookie, token refresh, dashboard, orders, order detail (tracking, status page), addresses (add/edit/delete/default), profile; cart linked to customer on login
- ✅ Predictive search overlay (`/api/search`)
- ✅ Consent banner (Shopify Customer Privacy API) + GA4/Meta loaded only after consent; events view_item, add_to_cart, begin_checkout, page_view
- ✅ sitemap.xml, robots.txt, Organization JSON-LD, default OG image
- ✅ Home: brand statement, quiz CTA, testimonials (metaobjects only), journal rail, benefits grid
- ✅ PLP: desktop filter sidebar, in-grid promo tile, SEO FAQ; PDP: journal rail, gallery fix for single images
- ✅ docs/DEPLOY.md, docs/BUILD_PLAN.md

### Verified
- End-to-end with real products: add to bag (optimistic 175 ms) → drawer → qty update → subtotal correct → cart survives reload → checkoutUrl on Shopify (blocked only by store password)
- Webhook HMAC → revalidateTag refreshes cached catalog
- 52 routes build; tsc + eslint clean; no console errors; no horizontal overflow at 390 px; light + dark checked

---

## Session 1 — 2026-09-25

### Context
- Client: Patrick Smith (via Anthony). Brand: **Worth Aesthetics**, peptide skincare, US market.
- Reference UX: oseamalibu.com/collections/shop. Visual: clinical + understated luxury (brand guide v2.4 in `client update/`, git-ignored).
- Stack: Next.js **16.3.6** (App Router, `cacheComponents` + `partialPrefetching`), React 19.2, Tailwind v4, Shopify Storefront API **2026-07**.
- Owner requirement: **light/dark theme switcher, default light**; premium + fully responsive.

### Credentials (in `.env`, git-ignored — verified live)
| Var | What it actually is |
|---|---|
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` (`fb9e…`) | Storefront public token ✅ works |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (`shpat_…`) | Headless-channel **private Storefront** token (only `unauthenticated_*` scopes — it is NOT an Admin token) ✅ works |
| `SHOPIFY_APP_CLIENT_ID` / `_SECRET` (`shpss_…`) | Dev-Dashboard app credentials. Client-credentials grant fails: `app_not_installed` ⛔ |
| `SHOPIFY_REVALIDATION_SECRET` | = app client secret (Shopify signs app-created webhooks with it) |
| Customer Account API ids | ⛔ not provided yet |

Store state: name "My Store", **0 products**, only `frontpage` collection, currency USD.

### Done
- ✅ `.env` + `.env.example`, `.gitignore` (`!.env.example`, `/client update/`)
- ✅ Design tokens (`app/globals.css`): brand palette + semantic tokens for light/dark, WCAG-checked
  - taupe `#B89F6B` fails on white for small text (2.56:1) → small taupe text uses `--accent-ink` `#7A653B` (5.5:1); dark theme accent `#C9B488` (9.2:1)
- ✅ Fonts via `next/font`: Inter (sans, Neue Haas substitute — TBC), Montserrat (labels), Cormorant Garamond italic
- ✅ Theme: `components/theme/*` — no-flash inline script, `data-theme` on `<html>`, localStorage `wa-theme`, default light
- ✅ Shopify layer `lib/shopify/*`: server-only client (private token), fragments/queries/mutations (all validated against live API), `'use cache'` + `cacheTag` + `cacheLife('days')` for catalog/content; cart never cached
- ✅ Cart: server actions (zod-validated), httpOnly cookie `wa_cart_id` (60 days), `useOptimistic` instant updates, drawer (native `<dialog>` focus-trap) with free-shipping bar, qty stepper, upsell, gift note, trust row, payment badges, checkout → `cart.checkoutUrl`
- ✅ Layout: announcement bar (metaobject `announcement` w/ fallback), sticky header + mega menu + mobile nav sheet, footer w/ newsletter
- ✅ Home: hero (metaobject `hero_slide` w/ fallback), trust strip, bestsellers rail (falls back to "Coming soon" teasers while catalog is empty), Science band, featured split, ingredient edit, ritual steps, editorial, email capture
- ✅ PLP `/collections/[handle]`: Search & Discovery filters (`?filter=` JSON), price range, sort, load-more (server action), empty states, `shop-all` virtual fallback, recently viewed
- ✅ PDP `/products/[handle]`: gallery (swipe/zoom), variants, qty, add-to-bag, **sticky mobile bar**, delivery/express messaging, benefits, accordions, ingredient spotlight, complete-your-ritual, FAQ, JSON-LD (Product, Breadcrumb, FAQPage)
- ✅ `/search`, `/policies/[handle]`, `/pages/[handle]`, branded 404
- ✅ `/api/revalidate` — HMAC-verified webhook → `revalidateTag(tag, "max")` (tested valid/invalid signatures)
- ✅ Build, `tsc`, `eslint` all clean; visual QA desktop + mobile, light + dark

### Known issues / notes
- `notFound()` inside a streamed Suspense boundary returns HTTP 200 with 404 UI (PPR behaviour); Next adds `noindex`. Revisit if SEO requires hard 404s.
- Product-image placeholders in `public/placeholder/` are client mockups — used only as fallbacks until Shopify has real media.
- Newsletter: validates but intentionally does **not** claim success until the provider (Klaviyo?) is confirmed.
- Reviews/ratings intentionally not shown (no provider yet — never fabricate).
- GraphQL types are hand-written (`lib/shopify/types.ts`); `@graphql-codegen` can be added later.
