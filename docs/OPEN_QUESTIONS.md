# Open Questions (TBC) — for the client

Items the storefront currently shows as placeholders. Nothing here should be presented as fact until confirmed.

## Brand & assets
- [ ] **Official logo** as SVG. Currently an original interim mark (hexagon + molecular W) in `components/brand/logo.tsx`, `app/icon.svg`, `public/brand/logo.svg`.
- [ ] **Neue Haas Grotesk web licence?** If not, we keep Inter as the substitute.
- [ ] Final product photography (on white / alabaster, marble & travertine). Current images are mockups.
- [ ] Social media URLs (Instagram, TikTok, Facebook) and contact email.

## Commerce
- [ ] **Free-shipping threshold** (placeholder: **$75**).
- [ ] **Dispatch time** (placeholder: "Orders placed before 1pm ET ship the same business day").
- [ ] **Returns policy** (placeholder: "Unopened products … within 30 days"). Also add the policy text in Shopify → Settings → Policies.
- [ ] Guarantee wording (if any).
- [ ] Prices, compare-at prices, variants/sizes for every SKU.
- [ ] Black jar with spatula — which product is it? Size?
- [ ] Leather pouch — sold as an accessory or gift-with-purchase?
- [ ] Sets/bundles planned? Contents & pricing.

## Claims & compliance
- [ ] **Cruelty-free / Leaping Bunny** — certified? (appears in the brand guide; not shown on site until confirmed)
- [ ] Any substantiated clinical results (percentages, study details) for a results block.
- [ ] Label claims "Deep repair" on the Snap-8 serum mock-up — "repair" can read as a drug claim in the US; suggest "visibly smoother, firmer-looking skin".
- [ ] PDRN source (e.g. salmon-derived?) for ingredient copy.
- [ ] Full INCI lists per product.

## Integrations
- [ ] Contact-form inbox (Resend API key + destination email) or another provider.
- [ ] Email/SMS: **Klaviyo** or Shopify Email? (newsletter form waiting on this)
- [ ] Reviews: Judge.me or Okendo?
- [ ] GA4 ID, Meta Pixel ID.
- [ ] Subscriptions (Subscribe & Save) — phase 2?
- [ ] Build-your-routine quiz — phase 2?

## Technical access
- [x] ~~Install the Dev-Dashboard app~~ — done.
- [x] ~~Disable the Online Store password~~ — done 2026-09-26; checkout verified.
- [ ] Confirm the placeholder prices on the 4 seeded products (tag `tbc`) and upload final photography.
- [x] ~~Customer Account API client ID~~ — received (public client, PKCE).
- [ ] Add https callback/origin/logout URIs in Headless → Customer Account API once the domain is live (Shopify rejects localhost).
- [ ] Rename the store from "My Store" (Settings → General) — it shows on checkout.
- [ ] Production domain (currently https://worth-aesthetics.vercel.app).
- [ ] **Demo catalogue:** 16 placeholder products (tag `demo`) + 6 Journal articles (tag `demo`) were added so the site isn't empty. Archive/replace them once the real range, prices and photography are final (Products → filter by tag `demo` → Archive).
- [ ] Policies: create Refund / Shipping / Terms in Settings → Policies (interim summaries are shown until then). Confirm dispatch cut-off and returns window.
