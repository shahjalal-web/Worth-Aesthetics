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
1. ⏳ Client/owner creates products + collections + metafield definitions in Shopify (see `docs/SHOPIFY_SETUP.md`) — the store is currently **empty**, so PLP/PDP/cart can't be tested end-to-end yet.
2. ⏳ Install the Dev-Dashboard app on the store (currently `app_not_installed`) → enables Admin API for `scripts/setup-metafields.ts` (to be written, with `--dry-run`).
3. ⏳ Phase 3: bespoke **Science** and **About** pages, blog/journal, metaobject-driven home sections.
4. ⏳ Predictive search overlay in header (API query already written: `predictiveSearch`).
5. ⏳ Phase 4: Customer Account API login, GA4/Meta + Shopify analytics, consent banner, sitemap/robots.

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
