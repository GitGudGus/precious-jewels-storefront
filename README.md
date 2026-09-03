# Precious Jewels — Storefront

Headless [Shopify](https://shopify.dev/docs/api/storefront) storefront for **Precious Jewels**
(Miami) — gold-filled, 18k gold, and silver jewelry.

Shopify stays the commerce backend (checkout, payments, Klarna/Afterpay, inventory, taxes,
shipping, POS). This repo is the customer-facing website.

- **Full plan:** [ROADMAP.md](ROADMAP.md)
- **Architecture:** [docs/architecture.md](docs/architecture.md)
- **Decisions:** [docs/decisions/](docs/decisions/)

## Status

🚧 Milestone 0 — in progress. App scaffolded, connected to the real Shopify store via
`lib/shopify/`, homepage renders the live shop name locally. Still needed: a GitHub push, a Vercel
deploy with env vars, and branch protection. See the roadmap.

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

## Getting this repo onto GitHub

The repo is initialised locally with one commit on `main`. To publish it:

**Option A — GitHub CLI:**

```bash
gh repo create precious-jewels-storefront --private --source=. --remote=origin --push
```

**Option B — manual:** create an empty repo named `precious-jewels-storefront` on github.com
(no README/gitignore/license), then:

```bash
git remote add origin git@github.com:<your-username>/precious-jewels-storefront.git
git push -u origin main
```

Start it **private**. Flip to public for the portfolio once there's something to show.

## Contributing (to future-you)

- Branch per change, open a PR even when solo — it's your changelog
- CI must pass before merge (lint, typecheck, build)
- Keep every Shopify call inside `lib/shopify/`
