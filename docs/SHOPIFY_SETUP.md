# Shopify Setup — what to create in the admin

The storefront reads **all** content from Shopify. Until these exist, the site shows tasteful fallbacks.

## 1. Products
For each product: title, description, images (first image = card image; second = hover image), price, compare-at price (for "Save X%" badges), variants (e.g. 30 ml / 50 ml), SEO title/description.
Tag a product `hidden` to hide it from the storefront.

## 2. Product metafields — namespace `wa`
Settings → Custom data → Products → Add definition. Tick **"Storefronts" access** on every definition.

| Name | Key | Type |
|---|---|---|
| Subtitle | `subtitle` | Single line text |
| Active complex | `active_complex` | Single line text |
| Size label | `size_label` | Single line text |
| Badge | `badge` | Single line text (New / Bestseller / Limited) |
| Routine step | `routine_step` | Single line text |
| Benefits | `benefits` | List of single line text |
| Skin concerns | `skin_concerns` | List of single line text |
| Skin types | `skin_types` | List of single line text |
| Results claims | `results_claims` | List of single line text |
| How to use | `how_to_use` | Rich text |
| Full ingredients (INCI) | `full_ingredients_inci` | Multi-line text |
| Key ingredients | `key_ingredients` | List of metaobject references → `ingredient` |
| FAQ | `faq` | List of metaobject references → `faq_item` |
| Pairs well with | `pairs_well_with` | List of product references |

## 3. Metaobject definitions (Storefront access ON)
| Type | Fields (key → type) |
|---|---|
| `ingredient` | `name` text · `short_description` text · `image` file (image) |
| `faq_item` | `question` text · `answer` multi-line text |
| `hero_slide` | `eyebrow` text · `headline` text · `subline` text · `cta_label` text · `cta_link` text/url · `image` file (image) |
| `announcement` | `text` single line text |

## 4. Collections (handles must match)
`shop-all`, `serums`, `creams-moisturizers`, `sets`, `bestsellers`, `new`, `accessories`, `anti-wrinkle`, `firming`, `texture`, `radiance`, `hydration`.

## 5. Filters
Install **Shopify Search & Discovery** → Filters → add: Availability, Price, Product type, and the metafields `wa.skin_concerns`, `wa.skin_types`.

## 6. Headless channel
Make sure every product/collection is **published to the Headless channel** (otherwise the Storefront API won't return it).

## 7. Webhooks (cache revalidation)
Settings → Notifications → Webhooks (or via the app), JSON format, URL `https://<domain>/api/revalidate`:
`products/create`, `products/update`, `products/delete`, `collections/create`, `collections/update`, `collections/delete`.
Admin-created webhooks are signed with the key shown on that page — put it in `SHOPIFY_REVALIDATION_SECRET`.

## 8. Policies
Settings → Policies: Privacy, Refund, Shipping, Terms. They render at `/policies/<handle>`.
