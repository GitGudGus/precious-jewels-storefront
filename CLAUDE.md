@AGENTS.md

# Precious Jewels Storefront — Project Notes for Claude

This file is maintained by Claude across sessions to keep continuity on this project. Update it
whenever a milestone advances, a real gotcha is discovered, or a decision changes. Keep entries
factual and dated where it matters — don't let this file rot into fiction.

## What this project is

A headless Shopify storefront for **Precious Jewels** (Miami) — gold-filled, 18k gold, and silver
jewelry. Phase 1 (this repo) is a Next.js storefront on top of Shopify's Storefront API. Phase 2
(a future, separate repo) is a Django + DRF wholesale/B2B portal. Full plan: [ROADMAP.md](ROADMAP.md).
Architecture: [docs/architecture.md](docs/architecture.md). Decision records: [docs/decisions/](docs/decisions/).

**The one rule that matters most:** every Shopify API call goes through `src/lib/shopify/`. Never
call Shopify directly from a component or route. This is what keeps hosting/framework changes
cheap later.

## Current status (as of 2026-09-03)

**Milestone 0 (Foundations) — complete.** Storefront is scaffolded, connected to Shopify, live on
Vercel, CI is green, and `main` is protected. Next: Milestone 1 (catalog/browsing).

Done:

- Next.js 16.3.4 (App Router, TypeScript, Tailwind 4) scaffolded via `create-next-app`, merged into
  the repo root without disturbing the pre-existing docs (`README.md`, `ROADMAP.md`, `docs/`,
  `.github/`, `.gitignore`, `.vscode/`)
- Prettier added and wired into ESLint (`eslint-config-prettier` in `eslint.config.mjs`) so lint
  and format don't conflict; `.editorconfig` added
- `src/lib/shopify/client.ts` — Shopify Storefront API client via `@shopify/storefront-api-client`,
  reading `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_ACCESS_TOKEN` from env, pinned to API
  version `2025-10`
- `src/lib/shopify/queries/shop.ts` + `src/lib/shopify/shop.ts` — the proof-of-connection query
  (fetch shop name)
- Homepage (`src/app/page.tsx`) renders the live shop name server-side — **verified working
  end-to-end against the real store** (`shop-precious-jewels.myshopify.com`), returned
  `"Precious Jewels "` (note: trailing space comes from the shop's own name field in Shopify
  admin, not a bug in our code)
- `.env.local` populated with real credentials (gitignored, confirmed never tracked); `.env.example`
  committed with blank values
- CI workflow (`.github/workflows/ci.yml`) rewritten — it used to be a placeholder that skipped all
  steps if `package.json` was absent; now it actually runs `npm ci` → lint → `next typegen` →
  `tsc --noEmit` → `build`
- Repo pushed to GitHub: [github.com/GitGudGus/precious-jewels-storefront](https://github.com/GitGudGus/precious-jewels-storefront)
  (private). GitHub account is `GitGudGus`, `gh` CLI already authenticated locally with `repo` +
  `workflow` scopes.
- `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` added as GitHub Actions repo secrets
  (set via `gh secret set --env-file .env.local`, with the user's explicit go-ahead — this is a
  sensitive action the permission system blocks by default, expect to ask again for anything
  similar, e.g. Vercel env vars if done via API/CLI rather than their dashboard)
- CI confirmed green on `main` end to end (lint, typegen, typecheck, build all pass against the
  real Shopify secrets)
- **Vercel project `precious-jewels` created** (imported from GitHub), both env vars
  (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`) set for Production + Preview via the
  dashboard, deployed green — homepage live at `precious-jewels.vercel.app` rendering the shop
  name. First deploy failed with `Shopify Storefront API error: GraphQL Client: fetch failed`
  during static prerender of `/`; root cause was the Vercel env var value, fixed by re-entering it
  cleanly (see gotcha below).

- **Repo made public** (`gh repo edit --visibility public`) — GitHub branch protection *and*
  rulesets both require GitHub Pro on a *private* repo (confirmed via API, HTTP 403). Going public
  unlocks rulesets on the free plan and gives unlimited Actions minutes. Verified clean before
  flipping: `.env.local` never tracked, the Storefront token appears nowhere in git history, only
  `.env.example` (blank values) is committed. (The public Storefront token is designed for
  client-side exposure anyway, so this is low-stakes even setting aside the history being clean.)
- **Branch protection on `main`** — GitHub ruleset "main protection" (id 22203545, enforcement
  `active`): blocks direct push (PR required, 0 approvals), blocks force-push and deletion, requires
  the CI `verify` status check to pass with branches up to date. Applies to admins too (no bypass
  actors set) — add a bypass actor in repo Settings → Rules if self-PRs get tedious.

## Shopify setup — what actually worked (important, non-obvious)

The roadmap originally described creating a **custom app** via
**Shopify admin → Settings → Apps and sales channels → Develop apps** to get a Storefront API
token. **This path is stale as of Jan 2026** — Shopify moved app development to the **Dev
Dashboard**, and the old custom-app screen is retired for new setups.

We went through real trial and error on this during setup, worth remembering:

1. The Dev Dashboard is for building full apps (Admin API scopes, OAuth, CLI automation). It is
   **not** the right tool for a Storefront-only token.
2. The Dev Dashboard's **"app automation token"** authenticates the Shopify CLI for CI/CD
   deploys of app config/extensions. It has nothing to do with API data access. Do not use it here.
3. The `client_credentials` OAuth grant (`POST /admin/oauth/access_token` with `client_id` +
   `client_secret`) issues an **Admin API access token** — private, powerful, 24-hour expiry, and
   it does not work against the Storefront GraphQL endpoint at all. This was a dead end we
   confirmed via Shopify's own docs before wasting more time debugging why the curl command
   "wasn't returning anything" (root cause was moot — wrong token type regardless).
4. **What actually worked:** install the **Headless** channel from the Shopify App Store, click
   **Create storefront**. This immediately hands you a **public** Storefront access token (safe
   client-side — this is what's in `.env.local`) and a **private** one (server-side only, not
   currently used, keep it if it ever surfaces but don't put it in this project's env vars) —
   no OAuth, no client ID/secret involved.

ROADMAP.md's Milestone 0 step 3 and Appendix B have been updated to reflect this. If Shopify
changes this flow again, update both places, not just one.

## Gotchas discovered during setup

- **`SHOPIFY_STORE_DOMAIN` must be the `*.myshopify.com` domain, never `preciousjewels.co`.** The
  custom domain currently points at the existing live Shopify theme and will be repointed to
  Vercel at the Milestone 5 domain cutover. If the storefront were configured to fetch Shopify
  data from `preciousjewels.co`, that cutover would make it fetch from itself instead of Shopify —
  a silent production break. Always use the `.myshopify.com` domain for `SHOPIFY_STORE_DOMAIN`.
- **`npx tsc --noEmit` fails on a fresh checkout** with `Cannot find name 'LayoutProps'`. This is
  an ambient type Next.js generates into `.next/types/` — it doesn't exist until you've run
  `next build`, `next dev`, or `npx next typegen` at least once. CI runs `next typegen` before the
  typecheck step for this reason; do the same locally after a clean clone or after deleting `.next`.
- The Shopify Storefront API client throws at build/render time if credentials are wrong — this is
  expected and desirable (surfaced cleanly as `GraphQL Client: Unauthorized` during local testing
  with placeholder values, rather than failing silently).
- **`fetch failed` vs `Unauthorized` when diagnosing a bad Shopify config:** `GraphQL Client:
  Unauthorized` means the request reached Shopify and the *token* was rejected. `GraphQL Client:
  fetch failed` means the request never got there — almost always a malformed `SHOPIFY_STORE_DOMAIN`
  (protocol prefix, trailing slash, or a stray space/newline from pasting into a dashboard field).
  Hit this on the first Vercel deploy; the value needed to be exactly `shop-precious-jewels.myshopify.com`.
- The homepage (`/`) is a plain server component with no dynamic APIs, so `next build` **statically
  prerenders it at build time** — the Shopify `getShopName()` call runs on the build machine (CI and
  Vercel), not per-request. That's why a bad env var fails the *build* rather than just a request.
  Fine for now (shop name never changes); revisit with `revalidate`/dynamic rendering when the
  homepage shows real catalog data in M1.

## Conventions to keep following

- All Shopify calls live under `src/lib/shopify/` — client, one query file per concern
  (`queries/shop.ts` so far), and a thin function per operation (`getShopName()` pattern) that
  throws on `errors` or missing `data` rather than returning `undefined` silently.
- Prettier formats everything (`npm run format` / `npm run format:check`); ESLint defers to it via
  `eslint-config-prettier` — don't add formatting rules to `eslint.config.mjs`.
- Docs (`README.md`, `ROADMAP.md`, `docs/architecture.md`) are meant to be kept current as the
  project evolves, not written once and left stale — this is an explicit project value, not
  incidental. When a real-world platform change invalidates something documented (like the Shopify
  auth flow above), fix the docs in the same session, don't just note it in chat.
- No commits are made unless the user explicitly asks for one — confirmed working pattern this
  session (extensive scaffolding and file changes were made and left uncommitted for the user to
  review).
- Env secrets: `.env.local` is gitignored and confirmed to never appear in `git status`. Prefer not
  having the user paste tokens into chat when avoidable, though it's low-stakes for the _public_
  Storefront token specifically (it's designed to be exposed client-side anyway).

## Next steps (pick up here)

M0 is done. Start **Milestone 1 (catalog/browsing)** — see ROADMAP.md M1:

1. Data layer in `src/lib/shopify/` — queries + thin functions for collections and for a single
   product with all variants/images (follow the existing `queries/shop.ts` + `shop.ts` pattern:
   one query file per concern, a function that throws on `errors`/missing `data`).
2. Browse UI (collection listing, product grid) and the product detail page, responsive.

Uncommitted as of end of this session: doc updates to CLAUDE.md, ROADMAP.md, README.md, plus the
pre-existing `.gitignore` / `.vscode/extensions.json` changes. Nothing committed (per project
convention — user commits).
