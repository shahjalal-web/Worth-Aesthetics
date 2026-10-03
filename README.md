# Worth Aesthetics — Headless Storefront

Custom e-commerce storefront for **Worth Aesthetics** (clinical peptide skincare), built with **Next.js** on top of **Shopify**.

- **Live site:** https://www.worthaesthetics.com
- **Checkout:** https://checkout.worthaesthetics.com (Shopify-hosted)
- **Hosting:** Vercel (auto-deploys from the `main` branch)

All products, collections, prices, FAQs, ingredients, announcements and blog posts are managed in **Shopify admin**. Edits appear on the site within seconds via webhooks; no code changes or redeploys needed.

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components, Cache Components) · React 19 · TypeScript (strict) |
| Styling | Tailwind CSS v4 with brand design tokens · light & dark theme |
| Commerce | Shopify Storefront API 2026-07 (catalog, search, cart) · Shopify-hosted checkout |
| Accounts | Shopify Customer Account API (OAuth 2.0 + PKCE): orders, addresses, profile |
| Content | Shopify metafields (`worth.*`) and metaobjects |
| Caching | Tag-based cache + HMAC-verified Shopify webhooks (`/api/revalidate`) |
| Forms | Contact → private Shopify metaobject (+ optional Resend email) · Newsletter → Shopify customer with marketing consent |
| Privacy | Consent banner synced with Shopify Customer Privacy API; analytics only after consent |

---

## Getting started (developers)

```bash
npm install
cp .env.example .env      # fill in the values (see below)
npm run dev               # http://localhost:3000
npm run build             # production build — must pass before deploying
npm run lint
```

> Customer login only works on an **https** domain registered in Shopify, not on `http://localhost`.

### Environment variables

See [`.env.example`](.env.example) for the full list. The real values are already set in **Vercel → Project → Settings → Environment Variables**. Never commit real values.

| Variable | Purpose |
|---|---|
| `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_API_VERSION` | Store and API version |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` / `_PRIVATE_TOKEN` | Storefront API (Headless channel) |
| `SHOPIFY_APP_CLIENT_ID` / `_SECRET` | Store app used by scripts, webhooks and form storage |
| `SHOPIFY_REVALIDATION_SECRET` | Webhook signature check (= app client secret) |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`, `CUSTOMER_SESSION_SECRET` | Customer login |
| `NEXT_PUBLIC_SITE_URL` | `https://www.worthaesthetics.com` |
| `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` | `checkout.worthaesthetics.com` |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | Free-shipping amount shown in the bag (USD) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Optional: email contact-form messages |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Optional: analytics (loaded only after consent) |

---

## Project structure

```
app/            Routes: home, collections, products, search, pages, blogs, policies, account, API
components/     UI by area: brand, layout, home, product, collection, cart, account, consent, ui
lib/            Shopify clients & queries, customer auth, SEO, analytics, recommendations
content/        Fallback copy (FAQ, ingredients, interim policies) used until Shopify has content
scripts/        One-off Admin API setup scripts (dry-run supported, idempotent, never delete data)
docs/           Setup, deployment and project notes
```

### Setup scripts (`scripts/`)

Run with `npx tsx --env-file=.env scripts/<name>.mts --dry-run` first, then without `--dry-run`.

| Script | What it does |
|---|---|
| `setup-metafields.mts` | Creates product metafield + metaobject definitions |
| `seed-content.mts` | Collections, blog, FAQ, ingredients, announcements |
| `setup-forms.mts` | Private storage for contact messages / newsletter sign-ups |
| `setup-webhooks.mts --url <site>` | Registers revalidation webhooks |
| `seed-products.mts`, `seed-demo-products.mts`, `seed-journal.mts` | Placeholder catalogue & articles (tagged `demo` / `tbc`) |
| `validate-queries.mts` | Validates every GraphQL query against the live API |

---

## Documentation

- [`docs/SHOPIFY_SETUP.md`](docs/SHOPIFY_SETUP.md): how to manage products, metafields, collections and content in Shopify
- [`docs/DEPLOY.md`](docs/DEPLOY.md): Vercel deployment, domains, webhooks
- [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md): items awaiting confirmation (prices, policies, payments…)
- [`docs/WORK_HISTORY.md`](docs/WORK_HISTORY.md): build log

---

## Content notes

- Products and journal articles tagged **`demo`** are placeholders. Archive them in Shopify (Products → filter by tag `demo`) once the real range is live.
- Shipping, returns and terms pages show interim summaries until the policies are published in **Shopify → Settings → Policies**.
- Marketing copy stays within US cosmetic claims (no medical/treatment claims).
