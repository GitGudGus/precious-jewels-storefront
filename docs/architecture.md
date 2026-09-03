# Architecture

_Last updated: 2026-09-03 (M0–M3a + Moonstone redesign + M5 code merged). Keep this current as the
system grows._

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

- **All Shopify access goes through `src/lib/shopify/`.** No exceptions. Keeps framework/hosting
  choices reversible. Client components import **values** only from the leaf modules
  (`format`, `constants`, `types`) — never the `index` barrel, which would drag the Shopify SDK
  into the browser bundle (this caused a production white-screen once; `client.ts` now has
  `import 'server-only'`).
- **Checkout is never rebuilt.** The storefront's job ends at the `checkoutUrl` handoff. Shopify
  issues that URL on its **primary domain**; at the domain cutover the primary is switched to
  `shop-precious-jewels.myshopify.com`, which resolves to Shopify's hosted checkout on `shop.app`.
  See `launch-checklist.md` §0.
- **The Storefront API public token is safe in the browser.** No BFF needed to proxy it.
  See [decisions/0003-defer-django-bff.md](decisions/0003-defer-django-bff.md).
- **Wholesale orders become Shopify draft orders**, so retail and wholesale share one fulfilment
  and inventory pipeline.

## Storefront internals (`src/`)

- **`lib/shopify/`** — `client.ts` (lazy, `server-only`) → `request.ts` (`storefront<T>()`, throws
  on GraphQL `errors` / missing `data`) → per-concern op files (`products`, `collections`, `cart`,
  `content`, `shop`). `queries/*` hold GraphQL strings composed from shared `fragments.ts`.
  `reshape.ts` is the boundary: raw GraphQL shapes never leave the folder. `index.ts` is the
  public barrel (server-side consumers only).
- **Rendering** — every route is statically generated (`generateStaticParams`,
  `dynamicParams=false`) with 15-minute ISR (`export const revalidate = 900`). Nothing is
  dynamic. `layout.tsx` reads no request state so it stays static; the cart is **client-hydrated**
  (a `CartProvider` fetches it on mount via a server action). Interactivity — variant picker,
  collection sort/pagination — is client components reading/writing URL state or calling
  `'use server'` actions, so pages stay static.
- **Cart** — Shopify `cartId` in an httpOnly `pj_cart` cookie (`src/components/cart/actions.ts`).
- **Design** — Moonstone theme reskin: tokens in `src/app/globals.css` `@theme`, primitives in
  `src/components/ui/`. One warm-light palette, no dark mode. Ovo + Jost via `next/font`.
- **Ops** — `src/app/{robots,sitemap}.ts`; JSON-LD in `src/components/seo/`; `@vercel/analytics` +
  `@vercel/speed-insights`; `@sentry/nextjs` env-gated (inert without `NEXT_PUBLIC_SENTRY_DSN`).

## Data model notes (as the live store actually is, 2026-09-03)

Product data lives in Shopify. The storefront queries these jewelry metafields **if present**:
`custom.materials`, `custom.care`, `custom.sizing` (rendered as `<details>` accordions on the PDP).
**None are defined in the store yet** — the PDP degrades cleanly. Any future keys (`made_to_order`,
`lead_time_days`, certification) would be added to the query in `src/lib/shopify/fragments.ts`.

Real catalog shape: ~350 products, mostly **single-variant**; a handful have one `Color` axis
(Gold/Silver), one has `Size`. **No metal/length axes.** The public Storefront token **cannot read
inventory quantities** (`totalInventory` / `quantityAvailable` → `ACCESS_DENIED`) — the storefront
uses `availableForSale` only, and surfaces post-add stock clamping from Shopify's cart `warnings`.

Online-store **pages** (`about-us`, `faqs`, `sizing-chart`, `contact-us-1`, `wholesale`) and the
four **shop policies** are authored in Shopify admin and rendered by `/pages/[handle]` +
`/policies/[handle]`. One blog (`news`), currently empty, backs `/journal`.

## Environments

| Env        | Storefront                     | Shopify                                           |
| ---------- | ------------------------------ | ------------------------------------------------- |
| local      | `localhost:3000`               | live store (`shop-precious-jewels.myshopify.com`) |
| preview    | Vercel PR deploys              | same                                              |
| production | `preciousjewels.co` (post-cut) | live checkout via `shop.app`                      |

Local dev and CI need only `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. The store is
currently **password-protected** (not publicly launched).
