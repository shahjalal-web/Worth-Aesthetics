# Build Plan — full site (Session 2)

Goal: match (and exceed) the depth of oseamalibu.com, in the Worth Aesthetics visual language.
Status: ✅ done · 🟡 partial · ⏳ todo · ⛔ blocked on client/access

## A. Shopify setup automation
- ✅ `scripts/lib/admin.mts` — Admin API client (token from `SHOPIFY_ADMIN_ACCESS_TOKEN` or client-credentials grant)
- ✅ `scripts/setup-metafields.mts` — metaobject definitions (`ingredient`, `faq_item`, `hero_slide`, `announcement`, `testimonial`) + `worth.*` product metafield definitions (Shopify needs ≥ 3-char namespace); `--dry-run`, idempotent, logs every change
- ✅ `scripts/seed-content.mts` — collections (handles from CLAUDE.md §5) + FAQ/ingredient/hero entries; `--dry-run`, idempotent, never deletes
- ✅ Ran against the live store (owner-approved)

## B. Content pages (bespoke design, Shopify-editable where possible)
- ✅ `/pages/science` — The Science / Our Peptides
- ✅ `/pages/about` — Our Story
- ✅ `/pages/ingredients` — Ingredient glossary
- ✅ `/pages/faq` — Help centre (+ FAQPage JSON-LD; entries from `faq_item` metaobjects)
- ✅ `/pages/contact` — contact form + details
- ✅ `/pages/accessibility` — accessibility statement
- ✅ `/pages/routine` — Build Your Routine quiz (maps answers → `worth.skin_concerns`)
- ✅ `/blogs/[blog]` + `/blogs/[blog]/[article]` — Journal (Shopify Blog)

## C. Customer order flow
- ✅ Add to bag → drawer → `checkoutUrl` (Shopify-hosted checkout & thank-you page)
- ✅ Customer Account API (OAuth 2.0 + PKCE): `/account/login`, `/account/authorize`, `/account/logout`
- ✅ `/account` dashboard, `/account/orders/[id]` order detail, addresses
- ✅ Cart ↔ customer: attach buyer identity on login so checkout is pre-filled and the order lands in the account
- ⛔ Needs Customer Account API client ID + an https callback URL (deployed domain or tunnel)

## D. Global UX
- ✅ Predictive search overlay in header
- ✅ Cookie consent banner (Shopify Customer Privacy API) — analytics only after consent
- ✅ GA4 + Meta Pixel + e-commerce events (view_item, add_to_cart, begin_checkout)
- ✅ Nav update: Journal, Build Your Routine

## E. Page upgrades
- ✅ Home: brand statement, routine-quiz CTA, testimonials (metaobjects), journal rail, benefits grid
- ✅ PLP: desktop filter sidebar, promo tile in grid, SEO FAQ at the bottom
- ✅ PDP: journal (learn) rail, single-image gallery fix
- ⏳ PDP: reviews block — waits for reviews provider (Judge.me/Okendo, TBC)

## F. SEO & infra
- ✅ `sitemap.xml`, `robots.txt`, Organization JSON-LD, default OG image
- ✅ `docs/DEPLOY.md` (Vercel)

## Not copied from OSEA (need client decision)
Subscribe & Save, rewards programme, gift cards, reviews widget, live chat, award badges — see `OPEN_QUESTIONS.md`.
