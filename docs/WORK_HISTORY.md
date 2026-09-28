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
0. ⏳ Client (message sent): design feedback, buy a domain, set sales tax + shipping rates, enable payment providers (Settings → Payments). Then: connect domain, update Customer Account URIs + NEXT_PUBLIC_SITE_URL + webhooks to the new domain.
1. ⏳ Owner: Shopify admin → Sales channels → Headless → storefront → Customer Account API → Application setup: callback `https://worth-aesthetics.vercel.app/account/authorize`, JavaScript origin `https://worth-aesthetics.vercel.app`, logout `https://worth-aesthetics.vercel.app/`. Vercel env `NEXT_PUBLIC_SITE_URL=https://worth-aesthetics.vercel.app` → redeploy. Then test login → order history.
2. ✅ Webhooks registered for worth-aesthetics.vercel.app (re-run with the final domain later).
3. ⏳ Owner: Settings → Policies → "Create from template" for Refund / Shipping / Terms (interim summaries show until then).
4. ⏳ Rename store "My Store" → "Worth Aesthetics" (shows on checkout); place a test order (Bogus gateway).
5. ⏳ Search & Discovery filters for `worth.skin_concerns` / `worth.skin_types`.
6. ⏳ Client items in `docs/OPEN_QUESTIONS.md`.

---

## Session 5 — 2026-09-28
- ✅ Domain live: **https://www.worthaesthetics.com** (apex → www 308, Vercel). Checkout: **checkout.worthaesthetics.com** (Shopify primary domain; `cart.checkoutUrl` now uses it). Sitemap + login redirect_uri already use www (NEXT_PUBLIC_SITE_URL set on Vercel).
- ✅ Webhooks registered for https://www.worthaesthetics.com/api/revalidate (11 topics); signed test → 200. Old vercel.app subscriptions still exist (harmless duplicates — delete in Shopify admin if desired).
- ✅ Consent: `storefrontRootDomain` = root domain (no www) so consent is shared with checkout.<domain>; local `.env` NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN=checkout.worthaesthetics.com (**Vercel env must be updated too**).
- ✅ **Official logo** from client vector ("client update/Worth Aesthetics 2.ai") → `components/brand/logo-paths.ts` (MONOGRAM, WORDMARK, LOCKUP extracted with PyMuPDF). Used in header, mobile menu, footer, sign-in (stacked), favicon (`app/icon.svg`, light/dark), apple icon + OG image (client champagne #C4AE74 / #EDEDED), `public/brand/logo.svg` + `logo.png` (Organization JSON-LD).
- ℹ️ Demo product packshots still carry the old interim hexagon mark (rendered earlier). Re-render + replace media only with owner OK (involves removing old product media).
- ✅ `write_customers` granted → newsletter now creates Shopify customers (tag `newsletter`, email marketing SUBSCRIBED); verified live with qa-newsletter-shopify@example.com. Earlier sign-ups remain in the `newsletter_signup` metaobject.
- ✅ Customer Account www URIs confirmed working (Shopify login page opens from www).
- ⏳ Owner: add www URIs in Shopify → Headless → Customer Account API (callback `https://www.worthaesthetics.com/account/authorize`, origin, logout); rename store "My Store".

---

## Session 4 — 2026-09-27
- ✅ Deployed on Vercel: **https://worth-aesthetics.vercel.app** (repo remote `myrepo` → github.com/shahjalal-web/Worth-Aesthetics, branch `main`). Login gives *redirect_uri mismatch* until the owner adds the callback URIs (see Next up #1) — code already sends the correct https URI.
- ✅ Brighter palette (owner found it too deep): new `--band*` tokens — announcement bar, science band, footer, dark page heroes, promo tile are now bright champagne in light mode (dark mode unchanged). Primary buttons = champagne `#C9B084` with charcoal text (6.7:1). Lighter surface/line tokens.
- ✅ Product cards equal height: `h-full` on the card + fixed-height slots (title 2 lines, subline 2 lines, size/pill row, price).
- ✅ Demo catalogue (owner-requested): `scripts/demo-catalog.mts` + `seed-demo-products.mts` → **16 products** tagged `demo` + `tbc` (serums, creams, cleanser, 4 sets with compare-at, 3 accessories; multi-size variants). Packshots rendered by `scripts/generate-placeholder-images.mts` (SVG → JPEG, local copies git-ignored). Every collection now has products.
- ✅ Journal: `scripts/seed-journal.mts` → 6 educational articles (tag `demo`).
- ✅ Policies: interim summaries (`content/policy-fallbacks.ts`) for shipping / refund / terms when Shopify's policy is empty — Shopify text wins automatically.
- ✅ Home: added "New from the lab" and "Curated pairings" (sets) rails.
- ✅ Address form bug ("Too big: expected string to have <=3 characters" when typing a full state name) → US state `<select>` (`lib/us-states.ts`), server accepts code or name, phone normalised to E.164, country fixed to US.
- ✅ Branded sign-in / create-account page (`components/account/sign-in.tsx`): split layout, tabs, email forwarded as `login_hint` + `login_hint_mode=submit`, "Continue with Shop".
- ℹ️ Login methods: Customer Account API (required by CLAUDE.md) offers only email one-time code + Shop. Email+password needs *legacy* accounts (deprecated by Shopify); Google/phone need a third-party app + custom auth — awaiting owner decision.
- ✅ Cart drawer redesigned (compact header/lines/footer, horizontal upsell cards with reasons). Upsell is now cart-aware: `/api/recommendations` → `lib/recommendations.ts` (Search & Discovery COMPLEMENTARY +4, missing ritual step +3, Shopify RELATED +2, bestsellers fallback).
- ✅ Quiz: rule-based (no AI) — builds by ritual step (cleanser/serum/cream), shows why each product matched, suggests a matching set. `productType` added to card + cart line fragments.
- ✅ ZIP validation (5-digit US) + friendly message when Shopify rejects ZIP/state combination.
- ✅ Contact form works: saved privately in Shopify (metaobject `contact_message`, admin → Content → Metaobjects) + optional Resend email. Newsletter works: Shopify customer with email-marketing consent (needs `write_customers` scope — not granted yet) → falls back to private `newsletter_signup` metaobject. `scripts/setup-forms.mts` created both definitions (run 2026-09-27). Runtime Admin client `lib/shopify/admin.ts` (server-only) — deliberate, owner-requested exception to the "Admin API only in scripts" rule. QA entries: qa-test@example.com / qa-newsletter@example.com.
- ✅ Home: tabbed "Shop the edit" carousel (Bestsellers/New/Sets/Shop all, 12 each, arrows + progress), "Shop by concern" tiles, "Our story" split (reference-site parity).
- ✅ Webhooks registered → https://worth-aesthetics.vercel.app/api/revalidate (products ×3, collections ×3, inventory, metaobjects ×3 with type filter, shop/update). Signed test POST to Vercel → 200, tags revalidated. Blogs/pages/policies have no webhook topic → cacheLife "hours".
- ✅ Live Vercel contact form verified (Vercel has the app credentials).
- ✅ QA: axe (WCAG 2.2 AA) clean on 10 key pages in light + dark; mobile 390px no overflow; Lighthouse mobile on Vercel: Home 95 / PLP 92 / PDP 98 performance, a11y 100/99→fixed/100, BP 100, SEO 100. Fixed: hero slow-zoom animation made Chrome report NO_LCP; heading order; label/name mismatch.
- ℹ️ Vercel env must include SHOPIFY_APP_CLIENT_ID / SHOPIFY_APP_CLIENT_SECRET for the contact/newsletter storage.
- ℹ️ Login cannot work on http://localhost (Shopify only accepts https callbacks) — test on Vercel or via an https tunnel.

---

## Session 3 — 2026-09-26
- ✅ Customer Account client ID saved (`.env`); `/account/login` redirects correctly to Shopify OAuth. Shopify returns **redirect_uri mismatch** for localhost — needs the https domain (expected).
- ✅ Store password removed by owner → Shopify checkout verified loading with the cart (NAD+ PDRN Serum $88).
- ✅ Original interim logo: hexagon "peptide ring" + W drawn as a molecular chain, taupe apex node. Used in header, mobile menu, footer, favicon (`app/icon.svg`), apple icon, OG image, Organization JSON-LD (`public/brand/logo.svg`). Removed default Next favicon.

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
