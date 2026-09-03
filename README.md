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

🚧 Milestone 1 (catalog/browsing) — in progress. Data layer + browse routes merged; product
detail page in review. Routes: `/`, `/collections`, `/collections/[handle]`, `/products/[handle]`
— all statically generated with 15-minute ISR. See the roadmap.

## Stack

| Layer        | Choice                           |
| ------------ | -------------------------------- |
| Framework    | Next.js (App Router, TypeScript) |
| Styling      | Tailwind CSS + shadcn/ui         |
| Commerce API | Shopify Storefront API (GraphQL) |
| Hosting      | Vercel                           |
| Errors       | Sentry                           |

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
