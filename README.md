# Precious Jewels — Storefront

Headless [Shopify](https://shopify.dev/docs/api/storefront) storefront for **Precious Jewels**
(Miami) — gold-filled, 18k gold, and silver jewelry.

Shopify stays the commerce backend (checkout, payments, Klarna/Afterpay, inventory, taxes,
shipping, POS). This repo is the customer-facing website.

- **Full plan:** [ROADMAP.md](ROADMAP.md)
- **Architecture:** [docs/architecture.md](docs/architecture.md)
- **Decisions:** [docs/decisions/](docs/decisions/)

## Status

✅ Milestone 0 — done. Live on Vercel (`precious-jewels.vercel.app`), CI green, `main` protected.

✅ Milestone 1 (catalog/browsing) — done. `/`, `/collections`, `/collections/[handle]`,
`/products/[handle]` — statically generated with 15-minute ISR. Variant selector, gallery, SEO
metadata.

✅ Milestone 2 (cart + checkout handoff) — done. Slide-out cart drawer, `cartId` in a cookie,
free-shipping progress bar, "Checkout" hands off to Shopify's hosted checkout.

🎨 Design pass — done. Reskinned to the "Moonstone" theme: Ovo/Jost type, warm cream/sand/ink
palette, full-bleed section bands. Tokens in `src/app/globals.css`, primitives in
`src/components/ui/`.

✅ Milestone 3a (content + legal) — done. About, FAQ, Sizing, Contact, Wholesale, and the four
policy pages render from Shopify admin; `/journal` blog shell; `sitemap.xml`. Customer accounts
(M3b) deferred post-launch.

🚧 Milestone 5 (launch prep) — in progress. SEO (sitemap, robots, JSON-LD, canonicals), old-theme
redirects, accessibility pass, analytics + error monitoring. Cutover runbook:
[docs/launch-checklist.md](docs/launch-checklist.md).

## Stack

| Layer        | Choice                              |
| ------------ | ----------------------------------- |
| Framework    | Next.js 16 (App Router, TypeScript) |
| Styling      | Tailwind CSS 4, Ovo + Jost (Google) |
| Commerce API | Shopify Storefront API (GraphQL)    |
| Hosting      | Vercel                              |
| Errors       | Sentry (M5)                         |

Phase 2 adds a separate repo: a Django + DRF wholesale/B2B portal.

## Local development

> Requires Node.js 20+.

```bash
nvm install --lts          # if you don't have Node yet
npm install
cp .env.example .env.local  # then fill in your Shopify tokens
npm run dev                 # http://localhost:3000
```

Never commit `.env.local`. `.env.example` holds the variable names with blank values.

**Getting the Shopify values:** install the **Headless** channel from the Shopify App Store, click
**Create storefront**, and copy the public Storefront access token it generates (no OAuth/custom
app needed — see [ROADMAP.md](ROADMAP.md) Milestone 0, step 3). `SHOPIFY_STORE_DOMAIN` is your
`*.myshopify.com` domain — not `preciousjewels.co`.

## Repo

Live at [github.com/GitGudGus/precious-jewels-storefront](https://github.com/GitGudGus/precious-jewels-storefront)
(public — made public so branch rulesets work on the free plan; no secrets are in the repo or its
history). CI runs on every push and PR to `main`; repo secrets (`SHOPIFY_STORE_DOMAIN`,
`SHOPIFY_STOREFRONT_ACCESS_TOKEN`) are set so the build step can fetch from Shopify. `main` is
protected by a ruleset — PRs only, CI must pass.

## Contributing (to future-you)

- Branch per change, open a PR even when solo — it's your changelog
- CI must pass before merge (lint, typecheck, build)
- Keep every Shopify call inside `lib/shopify/`
