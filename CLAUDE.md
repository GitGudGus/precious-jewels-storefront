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

**Milestone 0 (Foundations) — complete.** Storefront scaffolded, connected to Shopify, live on
Vercel, CI green, `main` protected.

**Milestone 1 (Catalog / browsing) — in progress, 3 staged PRs:**

- PR #1 `m1-data-layer` — **merged.** `src/lib/shopify/` data layer: `types.ts`, `fragments.ts`,
  `queries/{products,collections}.ts`, `reshape.ts` (raw→domain), `request.ts` (`storefront<T>()`
  helper — the `getShopName` throw-on-error contract, factored out), `products.ts` / `collections.ts`
  (thin ops: `getProduct`, `getProducts`, `getProductHandles`, `getCollections`, `getCollection`,
  `getCollectionProducts`, `getCollectionHandles`), `format.ts`, barrel `index.ts`.
- PR #2 `m1-browse` — **merged.** Header/Footer in the layout, homepage rebuilt, `/collections`
  (empty collections filtered out), `/collections/[handle]` (SSG, ISR 900s). Sort + "load more"
  are client-side against a `'use server'` action.
- PR #3 `m1-pdp` — **open.** `/products/[handle]` (SSG, ISR 900s), `ProductPurchasePanel` /
  `VariantSelector` / `ProductGallery`, JSON-LD + OG metadata.

Next: finish M1 (Lighthouse check, optional metafield setup), then Milestone 2 (cart + checkout
handoff).

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

- **Repo made public** (`gh repo edit --visibility public`) — GitHub branch protection _and_
  rulesets both require GitHub Pro on a _private_ repo (confirmed via API, HTTP 403). Going public
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
Unauthorized` means the request reached Shopify and the _token_ was rejected. `GraphQL Client:
fetch failed` means the request never got there — almost always a malformed `SHOPIFY_STORE_DOMAIN`
  (protocol prefix, trailing slash, or a stray space/newline from pasting into a dashboard field).
  Hit this on the first Vercel deploy; the value needed to be exactly `shop-precious-jewels.myshopify.com`.
- The homepage (`/`) is a plain server component with no dynamic APIs, so `next build` **statically
  prerenders it at build time** — the Shopify `getShopName()` call runs on the build machine (CI and
  Vercel), not per-request. That's why a bad env var fails the _build_ rather than just a request.

### M1 gotchas

- **The public Storefront token can't read inventory quantities.** `totalInventory` and
  `Variant.quantityAvailable` return `ACCESS_DENIED` (needs the `unauthenticated_read_product_inventory`
  scope, toggled on the Headless storefront in Shopify admin). `availableForSale` (product + variant)
  works — that's all M1 uses. Revisit if M1+ wants "low stock" / "made to order" badges.
- **No `custom.*` metafields exist in the store.** The PDP queries `custom.materials` / `custom.care`
  / `custom.sizing` and renders each section only if it has content, so it degrades cleanly. Real
  content needs metafield _definitions_ + values added in Shopify admin.
- **`notFound()` on a dynamically-rendered route returns a soft 404 (HTTP 200 + the not-found UI).**
  Reading the `searchParams` prop in a Server Component forces full dynamic rendering, which triggers
  this. Fix pattern used here: keep list/detail routes **statically generated** (`generateStaticParams`
  - `export const revalidate`), and move anything URL-param-driven (collection sort, selected variant)
    to the **client** — read via `useSyncExternalStore` / write via `history.replaceState`. Then
    `notFound()` for real unknowns is a hard 404.
- **`dynamicParams = false` on `/collections/[handle]` and `/products/[handle]`.** Only handles that
  exist at build time are served; a new product/collection needs a redeploy to appear, but unknown
  URLs get a proper 404 (better for SEO than soft 404s). ~16 collections + ~350 products prerender
  in a few seconds, so the build cost is negligible. If catalog churn makes redeploys annoying,
  flip to `true` and add `noindex` handling for the soft-404 case.
- Shopify product images are on `cdn.shopify.com` — `next.config.ts` has an
  `images.remotePatterns` entry (`/s/files/**`). New image hosts need adding there.
- Some products have **numeric handles** (`/products/4`, `/products/316`) — real Shopify data, works
  fine as a route param, just looks odd.
- Storefront API `2025-10`: use `product(handle:)` / `collection(handle:)` (not the deprecated
  `*ByHandle`); the `nodes` connection shorthand works; product options are
  `options { id name optionValues { name } }`. A product with no real variants shows one option
  `Title: ["Default Title"]` — `reshape.ts` strips it so `product.options.length === 0` means
  "no variant picker".

## Conventions to keep following

- All Shopify calls live under `src/lib/shopify/` — client, one query file per concern
  (`queries/{shop,products,collections}.ts`), shared GraphQL fragments in `fragments.ts`, and a thin
  function per operation that goes through `storefront<T>()` in `request.ts` (throws on `errors` /
  missing `data`). Raw GraphQL shapes never escape the folder — `reshape.ts` converts them to the
  `types.ts` domain shapes at the boundary. Routes/components import from `@/lib/shopify` (barrel).
- Routes that render Shopify data set `export const revalidate = 900` (ISR). Dynamic-param routes
  add `generateStaticParams` + `dynamicParams = false`. The data layer itself stays cache-agnostic.
- Server Components fetch; interactivity (variant picker, sort, load-more) is Client Components that
  call `'use server'` actions or read the URL client-side — never a Server Component reading
  `searchParams` (see the soft-404 gotcha).
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

1. Merge PR #3 (`m1-pdp`). Then M1's code is done.
2. Close out M1 DoD: run Lighthouse mobile on a deployed PDP (target ≥ 90); optionally have the
   user define `custom.materials` / `custom.care` / `custom.sizing` metafields in Shopify admin so
   the PDP detail sections populate.
3. Milestone 2 — cart + checkout handoff. See ROADMAP.md M2. Cart functions go in
   `src/lib/shopify/` (`createCart`, `addCartLines`, …); `cartId` in a cookie; slide-out drawer;
   "Checkout" → Shopify's `checkoutUrl`. The disabled add-to-cart button in `ProductPurchasePanel`
   is the hook point.

The M1 branches also each carried a small docs commit alongside the code commit (M0 wrap-up on
PR #1, M1 DoD + gotchas on PR #3). Pattern: code commit + docs commit per PR.
