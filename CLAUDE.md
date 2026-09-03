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

**Milestone 1 (Catalog / browsing) — complete (3 PRs merged).** `src/lib/shopify/` data layer
(`types`, `fragments`, `queries/{products,collections}`, `reshape` raw→domain, `request` =
`storefront<T>()` throw-on-error helper, `products`/`collections` thin ops, `format`, barrel
`index`). Routes: `/` + `/collections` (static + ISR 900s), `/collections/[handle]` +
`/products/[handle]` (SSG via `generateStaticParams`, `dynamicParams=false`, ISR 900s). Header/
Footer, `ProductCard`/grid, `ProductPurchasePanel` (variant picker + gallery, selection in the URL
via `useSyncExternalStore`). Open M1 items (user tasks): Lighthouse check, `custom.*` metafield
definitions.

**Milestone 2 (Cart + checkout handoff) — merged.** `src/lib/shopify/cart.ts` + `queries/cart.ts` +
`cartFragment` + `reshapeCart` (`createCart`/`getCart`/`add`/`update`/`removeCartLines`, each
returns `{ cart, warnings }`). `constants.ts` = `FREE_SHIPPING_THRESHOLD` ($100) + `CART_COOKIE`.
`src/components/cart/actions.ts` (`'use server'`) reads/writes the `pj_cart` httpOnly cookie;
`CartProvider` (client) hydrates on mount so `layout.tsx` stays static. UI: `CartDrawer`,
`CartButton`, `AddToCartButton`. Post-merge incident: the Shopify client leaked into the browser
bundle via a barrel import → white screen; hotfixed (#5) + `server-only` guard (#6). See M2 gotchas.

**Moonstone redesign — done (2 PRs).** Reskinned the placeholder UI to the paid theme the user
provided (see `moonstone-design-reference` memory). **No dark mode** (dropped). Fonts: **Ovo**
(serif headings) + **Jost** (body, Futura sub) via `next/font`.

- **Design tokens** — `src/app/globals.css` `@theme`: `--color-bg` (cream `#fffdf8`) / `--color-surface`
  (sand) / `--color-ink` / `--color-ink-muted` / `--color-ink-invert` / `--color-line`;
  `--font-serif`/`--font-sans`; `--container-page` (1200px, → `max-w-page`); `--radius-pill`.
  Sharp corners everywhere; `rounded-pill` only on variant pills + the cart qty stepper.
- **`src/components/ui/`** — `Button`/`ButtonLink` (primary black-fill / outline), `Section`
  (full-bleed colour bands, `tone` prop, `max-w-page` inner — bands sit flush), `Reveal`
  (`IntersectionObserver` fade-in, reduced-motion safe), `Prose` (Shopify `descriptionHtml`).
- PR 1 `redesign-foundation` (merged) — tokens, fonts, primitives, shell: `Header` → server +
  client `HeaderBar` (announcement strip, centred serif wordmark, scroll-shrink), `Footer`,
  product/collection cards, cart drawer, `AddToCartButton`.
- PR 2 `redesign-pages` — every page: homepage (Section rhythm: hero → value props → new arrivals
  → categories → newsletter), `/collections`, `/collections/[handle]` (`<Section>`, `<Prose>`,
  restyled sort/load-more), `/products/[handle]` (Ovo title, `<Prose>`, `<details>` accordions for
  metafields), `ProductPurchasePanel` / `VariantSelector` (pills) / `ProductGallery`, `not-found`,
  loading. `<main>` lost its padding wrapper — pages own their layout via `<Section>`.
  `grep -rn "dark:|neutral-|Geist" src/` → empty.

Deferred (user tasks): M1 Lighthouse ≥ 90 on a PDP; M1 `custom.*` metafields; M2 Bogus-Gateway
test order. Redesign follow-ups if wanted: real hero photography, a proper mobile nav drawer,
sticky add-to-cart on mobile PDP, newsletter wiring.

**Milestone 3a (Content & legal pages) — PR `m3a-content` open.** The owner already authored this
content in Shopify admin; we just render it — **no CMS**.

- `src/lib/shopify/content.ts` + `queries/content.ts` — `getPage` / `getPageHandles` / `getPolicy`
  / `getArticles` / `getArticleHandles` / `getArticle`. `Page` / `Policy` / `Article` types +
  reshapers. `constants.ts` gained `CONTACT_EMAIL` (**TODO: user to confirm** — the store uses
  dept-specific addresses like `returns@` / `wholesale@`, no known generic one), `CONTACT_PAGE_HANDLE`,
  `SITE_URL` (`https://preciousjewels.co` — the M5 domain; used for `metadataBase` + `sitemap`).
- Routes (all SSG, ISR 900s): `/pages/[handle]` (about-us, faqs, sizing-chart, contact-us-1,
  wholesale — contact gets a `mailto:` CTA), `/policies/[handle]` (privacy-policy, refund-policy,
  terms-of-service, shipping-policy — empty policy → contact-line fallback), `/journal` (empty
  state) + `/journal/[handle]` (`dynamicParams=false`, 0 articles today).
- `Footer` rebuilt (Shop / Company / Help columns + Privacy/Terms bottom bar); header nav gained
  Journal + About. `src/app/sitemap.ts` enumerates everything.

**Milestone 3b (Customer accounts) — deferred, post-launch.** Customer Account API OAuth,
`/account` with order history + addresses. Needs Shopify admin config (new customer accounts,
client ID, callback URLs). Shopify's hosted account pages work meanwhile; not a launch blocker.

Next: M4 (search/filtering, merchandising, reviews) or M5 (launch prep — domain cutover, Sentry,
analytics). M3b whenever the owner wants headless accounts.

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

### M2 (cart) gotchas

- **Cart stock limits come back in `warnings`, not `userErrors`.** `cartLinesAdd`/`Update` with a
  quantity above what's in stock still "succeeds" — Shopify silently clamps the line and adds a
  `warnings` entry (`MERCHANDISE_NOT_ENOUGH_STOCK` / `MERCHANDISE_OUT_OF_STOCK`). `resolveMutation`
  in `cart.ts` throws only on `userErrors`; it passes `warnings` through, and `CartDrawer` shows
  them. Many real products have inventory of 1, so this fires a lot.
- **`checkoutUrl` uses the custom domain** — `https://preciousjewels.co/cart/c/<token>`, not
  `.myshopify.com`. Works today (that domain serves the live Shopify theme and Shopify routes
  `/cart/c/*` to checkout). **At the M5 domain cutover** (`preciousjewels.co` → Vercel) this needs
  revisiting — checkout will need to resolve to a Shopify-controlled host.
- **The cart is client-hydrated on purpose.** `layout.tsx` must never read the `pj_cart` cookie
  (or call `cookies()`) — that would make every route dynamic and undo the M1 SSG. Cookie access
  lives only in `src/components/cart/actions.ts` (`'use server'`); `CartProvider` fetches on mount.
- `cartLinesAdd` with a `merchandiseId` already in the cart **merges** into that line — no
  client-side dedupe needed.
- **Never import a value from the `@/lib/shopify` barrel in a client-reachable component.** The
  barrel (`index.ts`) re-exports from `./cart` / `./products` / … → `./request` → `./client`
  (the Shopify SDK). A value import drags all of that into the browser bundle. `client.ts` is now
  lazy so it no longer _crashes_ the browser, but it's still dead weight. Client components import
  `formatPrice`/`formatPriceRange` from `@/lib/shopify/format`, `FREE_SHIPPING_THRESHOLD` /
  `CART_COOKIE` from `@/lib/shopify/constants`, and `COLLECTION_SORT_OPTIONS` etc. from
  `@/lib/shopify/types`. `import type` from the barrel is fine (erased). This bit us after the M2
  merge (`CartDrawer` in the root layout pulled the barrel into every page → white screen); fixed
  in a hotfix. TODO: add `server-only` to `client.ts` so it fails the build instead.
- **`npm run build` / CI does not catch client-runtime crashes** — they don't execute browser JS.
  For anything touching a client component, load the built pages in a real browser (headless
  Opera/Chrome `--dump-dom` + `--enable-logging=stderr` works) before merging.

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

1. Merge PR `m2-cart` after clicking through the Vercel preview: add to cart from a PDP, drawer
   opens, badge updates, qty/remove work, refresh keeps the cart, Checkout reaches Shopify.
2. Close out remaining DoD items (user tasks): M1 Lighthouse ≥ 90 on a PDP; M1 `custom.*` metafield
   definitions in Shopify admin; M2 Bogus-Gateway test order (enable it in Shopify admin first).
3. **The Moonstone design pass** — the user provided a paid Shopify theme ("Moonstone", Dawn v11)
   as the visual/structural target. See the `moonstone-design-reference` memory. Current UI is a
   clean-minimal Tailwind placeholder; reskinning to Moonstone (Ovo/Jost fonts, cream-sand-black
   palette, sharp corners + rounded variant pills, section rhythm, PDP collapsible tabs) is its own
   milestone-sized chunk. User wants function (M2/M3) before the redesign.
4. Milestone 3 onward — see ROADMAP.md.

Delivery pattern that's working: staged PRs, each with a code commit + a docs commit; plan written
to a plan file and approved before building; live GraphQL probes to de-risk the Shopify surface
before writing the data layer.
