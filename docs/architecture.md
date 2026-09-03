# Architecture

_Last updated: 2026-09-03. Keep this current as the system grows._

## Overview

Precious Jewels runs a **headless Shopify** setup. Shopify is the commerce backend; this repo is
the storefront. A second system (Django wholesale portal) is added in Phase 2.

```
┌───────────────────────────────────────────────────────────────┐
│  CUSTOMERS                                                     │
└───────────────┬───────────────────────────────┬───────────────┘
                │                               │
   retail shopper                       wholesale buyer (Phase 2)
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│  Next.js storefront        │   │  Django + DRF wholesale portal │
│  (this repo, on Vercel)    │   │  (separate repo, on Render)    │
│                            │   │  - Postgres: buyers, pricing   │
│  lib/shopify/  ← all API   │   │  - Django admin for staff      │
│  calls live here           │   │                                │
└─────────────┬─────────────┘   └───────────────┬───────────────┘
              │ Storefront API                  │ Admin API
              │ (GraphQL, public token)         │ (GraphQL, private token)
              ▼                                 ▼
┌───────────────────────────────────────────────────────────────┐
│  SHOPIFY                                                       │
│  products · collections · variants · metafields                │
│  cart + hosted checkout (Klarna / Afterpay / cards)            │
│  customer accounts (Customer Account API)                      │
│  inventory · orders · fulfilment · taxes · shipping · POS      │
└───────────────────────────────────────────────────────────────┘
```

## Boundaries

| System                     | Owns                                                          | Does NOT own                                                  |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Shopify                    | money, inventory, orders, tax, shipping, POS, payment methods | look and feel, content, wholesale pricing rules               |
| Storefront (this repo)     | every retail pixel, SEO, performance, cart UX                 | payment, checkout, order data (reads only)                    |
| Wholesale portal (Phase 2) | buyer approval, trade pricing, MOQ rules, invoices            | fulfilment, inventory (delegates to Shopify via draft orders) |

## Key constraints

- **All Shopify access goes through `lib/shopify/`.** No exceptions. This is what keeps framework
  and hosting choices reversible.
- **Checkout is never rebuilt.** The storefront's job ends at the `checkoutUrl` handoff.
- **The Storefront API public token is safe in the browser.** No BFF is needed to proxy it.
  See [decisions/0003-defer-django-bff.md](decisions/0003-defer-django-bff.md).
- **Wholesale orders become Shopify draft orders**, so retail and wholesale share one fulfilment
  and inventory pipeline.

## Data model notes

Product data lives in Shopify. Jewelry-specific attributes are **Shopify metafields** defined in
admin and explicitly exposed to the Storefront API:

- `custom.materials` (e.g. "14k gold-filled", "925 sterling silver", "18k solid gold")
- `custom.care_instructions`
- `custom.sizing_guide`
- `custom.made_to_order` (boolean) + `custom.lead_time_days`
- `custom.certification` (for solid-gold / gemstone pieces, if applicable)

Variants use Shopify option sets — typically **Metal × Size** or **Metal × Length**. The PDP must
handle missing combinations (query `availableForSale` and `quantityAvailable` per variant).

## Environments

| Env        | Storefront          | Shopify                                                |
| ---------- | ------------------- | ------------------------------------------------------ |
| local      | `localhost:3000`    | live Shopify store, test-mode checkout (Bogus Gateway) |
| preview    | Vercel PR deploys   | same                                                   |
| production | `preciousjewels.co` | live checkout                                          |
