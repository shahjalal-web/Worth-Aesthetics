# Deploying the Worth Aesthetics storefront (Vercel)

## 1. Create the Vercel project
1. Push this repo to GitHub.
2. Vercel → **Add New Project** → import the repo. Framework: Next.js (auto-detected). No build settings to change.

## 2. Environment variables
Vercel → Project → Settings → Environment Variables. Copy every key from `.env.example`:

| Variable | Notes |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | `xxx.myshopify.com` |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` / `NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Headless channel public token |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Headless channel private token (server only) |
| `SHOPIFY_API_VERSION` | `2026-07` |
| `SHOPIFY_REVALIDATION_SECRET` | App client secret (signs app-created webhooks) |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Headless channel → Customer Account API |
| `CUSTOMER_SESSION_SECRET` | Random 32+ character string |
| `NEXT_PUBLIC_SITE_URL` | `https://www.your-domain.com` (must be https) |
| `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` | e.g. `checkout.your-domain.com` or the myshopify domain |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Optional — only load after consent |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | e.g. `75` |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact form |

Never add `SHOPIFY_ADMIN_ACCESS_TOKEN` or `SHOPIFY_APP_CLIENT_SECRET` to the *browser* (`NEXT_PUBLIC_*`).

## 3. Domain
Vercel → Domains → add `www.your-domain.com`. In Shopify, keep checkout on Shopify (optionally `checkout.your-domain.com` via Shopify → Domains).

## 4. Shopify settings that must be done once
1. **Online Store password** — disable it (Online Store → Preferences). While it's on, checkout redirects to the password page.
2. **Customer Account API** (Headless channel → Customer Account API → Application setup):
   - Callback URI: `https://www.your-domain.com/account/authorize`
   - JavaScript origin: `https://www.your-domain.com`
   - Logout URI: `https://www.your-domain.com/`
3. **Webhooks** — after the domain is live:
   ```bash
   npx tsx --env-file=.env scripts/setup-webhooks.mts --url https://www.your-domain.com
   ```
4. **Search & Discovery** app → Filters → add `worth.skin_concerns`, `worth.skin_types`, product type, price.

## 5. After deploy — checklist
- [ ] Home, a collection and a product load with real data
- [ ] Add to bag → drawer → Secure Checkout opens Shopify checkout
- [ ] Place a test order (Shopify → Settings → Payments → test mode / Bogus gateway)
- [ ] Sign in at `/account` → the test order appears
- [ ] Edit a product title in Shopify → site updates within ~1 minute
- [ ] `/sitemap.xml` and `/robots.txt` show the production domain
- [ ] Lighthouse mobile ≥ 90 on Home, a collection and a product

## Maintenance scripts (local only)
```bash
npx tsx --env-file=.env scripts/setup-metafields.mts --dry-run   # metafield + metaobject definitions
npx tsx --env-file=.env scripts/seed-content.mts --dry-run       # collections, blog, FAQ, ingredients
npx tsx --env-file=.env scripts/seed-products.mts --dry-run      # starter products (placeholders)
npx tsx --env-file=.env scripts/validate-queries.mts             # check all GraphQL against the live API
```
All scripts are idempotent, log every change and never delete data. Drop `--dry-run` to apply.
