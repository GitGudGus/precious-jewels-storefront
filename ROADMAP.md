# Precious Jewels — Build Roadmap

A headless Shopify storefront for [Precious Jewels](https://www.instagram.com/preciousjewelsmia/) (Miami).
Gold-filled, 18k gold, and silver jewelry. DTC storefront first, wholesale/B2B portal second.

This document is written for a beginner developer. Each milestone tells you the **goal**,
**why it matters**, **what you build**, **what you learn**, and a **definition of done** so you
always know when to move on.

---

## 1. The big picture

### What "headless" means here

Today Shopify renders `preciousjewels.co`. In a headless setup, Shopify stops being the website
and becomes a **commerce API** — a service you send queries to and get JSON back. You build and
host the entire customer-facing site yourself.

```
                          ┌─────────────────────────────┐
   Customer's browser ──▶ │  Next.js storefront (you)    │
                          │  - product pages, cart UI    │
                          │  - hosted on Vercel/Oxygen   │
                          └──────────────┬──────────────┘
                                         │ GraphQL
                                         ▼
                          ┌─────────────────────────────┐
                          │  Shopify Storefront API      │
                          │  - products, collections     │
                          │  - cart, checkout URL        │
                          │  - customer accounts         │
                          └──────────────┬──────────────┘
                                         │
                                         ▼
                          ┌─────────────────────────────┐
                          │  Shopify admin (unchanged)   │
                          │  - inventory, orders, POS    │
                          │  - payments, Klarna/Afterpay │
                          │  - taxes, shipping, fulfilment│
                          └─────────────────────────────┘
```

**What stays on Shopify:** checkout, payments, Buy-Now-Pay-Later, taxes, shipping labels,
inventory, the POS app for pop-ups, fraud screening, order management. This is deliberate — it is
the hard, regulated, money-losing-if-wrong part, and Shopify already does it well.

**What you build:** everything the customer sees before they click "Checkout" — plus, in Phase 2,
a wholesale portal Shopify can't give us without the $2,000/mo Plus plan.

### The two phases

| Phase       | What                   | Stack                                                         | Repo                    |
| ----------- | ---------------------- | ------------------------------------------------------------- | ----------------------- |
| **Phase 1** | DTC storefront         | Next.js (App Router, TypeScript) → Shopify Storefront API     | this repo               |
| **Phase 2** | Wholesale / B2B portal | Django + Django REST Framework + Postgres → Shopify Admin API | a new repo, added later |

We are **not** building a Django backend-for-frontend in Phase 1. The storefront doesn't need one
(see [docs/decisions/0003-defer-django-bff.md](docs/decisions/0003-defer-django-bff.md)). Python
enters in Phase 2, where a real backend app is genuinely warranted.

### The one rule that keeps choices reversible

**Every call to Shopify goes through one folder: `lib/shopify/`.** Never scatter `fetch()` calls
to Shopify through your components. If that rule holds, "switch hosting", "change frameworks", or
"add a caching layer" later means rewriting one folder, not the whole app.

---

## 2. Prerequisites — accounts and tools

Do these once before Milestone 0.

### Accounts (all have free tiers)

- [x] **GitHub** account + this repo pushed (see [README](README.md))
- [x] **Shopify admin access** — Storefront API token generated via the **Headless** channel (see
      M0 step 3 — this replaced the old "custom app" flow in 2026).
- [ ] **Vercel** account (sign in with GitHub) — for hosting the storefront
- [ ] **Sentry** account — error tracking (add in M5, but sign up now)
- [ ] A password manager entry or `.env.local` file to keep API tokens — **never commit these**

### Tools on your machine

- [ ] **Node.js 20 LTS or newer** — `node --version`. Install via [nvm](https://github.com/nvm-sh/nvm)
      (`nvm install --lts`) so you can switch versions later. _(Not currently installed — do this first.)_
- [ ] **npm** (ships with Node) or **pnpm** (`npm i -g pnpm`) — this roadmap assumes npm
- [ ] **Git** — already installed (2.55)
- [ ] **VS Code** + extensions: ESLint, Prettier, Tailwind CSS IntelliSense, GraphQL
- [ ] **GitHub CLI** (`gh`) — optional but makes pushing/PRs easier

### Knowledge to pick up as you go (don't front-load this)

- Basic **React** (components, props, state, `useState`, `useEffect`)
- Basic **TypeScript** (types on function arguments, interfaces) — learn it _while_ building
- What **GraphQL** is (you send a query describing exactly the fields you want)
- The **Next.js App Router** mental model: components render on the server by default

Recommended learning order: React docs "Learn" track → Next.js "App Router" tutorial →
Shopify's own [Storefront API docs](https://shopify.dev/docs/api/storefront). Don't try to
"finish" any of these before starting — build M1, get stuck, read the relevant page, continue.

---

## Milestone 0 — Foundations

**Goal:** a bare Next.js app, connected to Shopify, deployed to a live URL, with CI running.

**Why it matters:** you want a working deploy pipeline on day one, while there's nothing to break.
Every later milestone ships to the same pipeline. "Deploy last" is how projects die.

**What you build**

1. Install Node (nvm), then scaffold the app:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
   ```
2. Add Prettier + an ESLint config, a `.editorconfig`, and a `README` section on running locally.
3. As of Jan 2026, Shopify moved app development to the **Dev Dashboard** and retired the old
   admin "Develop apps" custom-app screen for new setups — but that Dev Dashboard flow is for
   building full apps (Admin API, OAuth, CLI automation tokens) and is the wrong tool for a
   Storefront-only token. Instead, install the **Headless** channel from the Shopify App Store,
   then click **Create storefront**. This immediately generates a **public** and a **private**
   Storefront access token — no OAuth, no client ID/secret. Use the public token (safe in the
   browser); the private one is for server-side use only, not needed yet.
   Store domain is your `*.myshopify.com` domain — **not** the custom/production domain
   (`preciousjewels.co`), since that gets repointed to Vercel at the Milestone 5 cutover and
   would break Storefront API calls if used here.
4. Create `lib/shopify/client.ts` using `@shopify/storefront-api-client`. Read the token and store
   domain from environment variables (`.env.local`, and `.env.example` committed with blank values).
5. Write one query: fetch the shop name. Render it on the homepage. This proves the connection.
6. Push to GitHub. Import the repo in **Vercel**. Add the env vars in Vercel's dashboard. Deploy.
7. Add a **GitHub Actions** workflow (`.github/workflows/ci.yml`) that runs `npm run lint`,
   `npm run build`, and `npx tsc --noEmit` on every pull request.
8. Protect the `main` branch: require the CI check to pass before merge. (Note: GitHub branch
   protection and rulesets require GitHub Pro on a **private** repo. This repo was made **public**
   at the end of M0 to unlock rulesets on the free plan.)

**What you learn:** Next.js project layout, environment variables and secrets hygiene, the Shopify
Headless-channel token flow, GraphQL basics, connecting a repo to a host, what CI is for.

**Definition of done**

- [x] `npm run dev` shows the live Shopify shop name pulled from the API
- [x] The same page is live on a `*.vercel.app` URL (`precious-jewels.vercel.app`)
- [x] Opening a PR runs lint + typecheck + build automatically
- [x] `main` can't be pushed to directly (GitHub ruleset "main protection", active; repo made
      public to unlock rulesets on the free plan); no secrets are in git history (verified — `.env.local`
      never tracked, token absent from all history)

---

## Milestone 1 — The catalog (browsing)

**Goal:** customers can browse collections, view a product with all its variants and images, on
any device.

**Why it matters:** jewelry sells visually. This is 70% of the site's value and the part Shopify's
default themes do least distinctively.

**What you build**

1. **Data layer** in `lib/shopify/`:
   - `getCollections()`, `getCollectionByHandle(handle)`, `getProductByHandle(handle)`,
     `getProducts({ sortKey, reverse, query })`
   - TypeScript types for `Product`, `ProductVariant`, `Collection`, `Money`, `Image`
   - A `reshapeProduct()` helper that flattens Shopify's GraphQL edges/nodes into clean objects
2. **Routes** (App Router):
   - `/` — homepage: hero, featured collection, new arrivals
   - `/collections/[handle]` — product grid with pagination
   - `/products/[handle]` — product detail page (PDP)
   - `/collections` — list of all collections
3. **PDP details that matter for jewelry:**
   - Variant selector — metal (gold-filled / 18k / silver), size, length. Update price + image +
     availability as the customer picks. Disable/grey-out unavailable combinations.
   - Image gallery with zoom (large hero + thumbnails). Use `next/image` for automatic resizing
     and lazy loading.
   - Materials, care instructions, sizing guide — pull from **Shopify metafields** (you define
     these in admin: `custom.materials`, `custom.care`, etc.)
   - "Made to order / ships in X days" badge from an inventory or metafield flag
4. **Rendering strategy:** static generation with revalidation (ISR) — pages build once and
   refresh every N minutes, so they're fast and still current when prices/stock change.
5. Loading skeletons and a not-found page.

**What you learn:** dynamic routes, `generateStaticParams`, React Server vs Client Components
(the variant selector is a Client Component; the page around it is a Server Component), image
optimization, modelling real product data, GraphQL pagination with cursors.

**Definition of done**

- [x] Every collection and product from Shopify renders with correct prices and images
      (351 product pages + 16 collection pages prerendered; `/`, `/collections`,
      `/collections/[handle]`, `/products/[handle]`)
- [x] Picking a variant updates price, image, and the add-to-cart button's enabled state
      (`ProductPurchasePanel`; selection stored in the URL via `useSyncExternalStore`)
- [~] Lighthouse mobile performance score ≥ 90 on a product page — **not yet measured**; needs a
  manual run against the deployed preview
- [~] Metafield content (materials, care) shows on the PDP — code renders `custom.materials` /
  `custom.care` / `custom.sizing` when present; **no metafield definitions exist in Shopify
  admin yet**, so nothing shows. User to define + fill them.
- [x] No layout shift as images load (`next/image` with intrinsic `width`/`height` or `fill`
      inside fixed-aspect containers) — spot-checked, not formally measured

---

## Milestone 2 — Cart and checkout handoff

**Goal:** customers can build a cart that persists, then hand off to Shopify's hosted checkout
(where Klarna/Afterpay and all payment methods already work).

**Why it matters:** this is the conversion moment. The cart must feel instant and never lose items.
Checkout itself stays on Shopify — you are _not_ rebuilding payment forms.

**What you build**

1. **Cart in `lib/shopify/`:** `createCart()`, `addCartLines()`, `updateCartLines()`,
   `removeCartLines()`, `getCart(id)`. Shopify's Cart API returns a `checkoutUrl` — that's the
   handoff link.
2. **Persistence:** store the Shopify `cartId` in a cookie (via Next.js server actions / route
   handlers). Reload the page — cart is still there. Use it from another tab — still there.
3. **UI:**
   - Add-to-cart button on the PDP (Client Component, optimistic update)
   - Slide-out cart drawer: line items, quantity steppers, remove, subtotal, "Checkout" button
   - Cart count badge in the header
   - Free-shipping-threshold progress bar (a nice, easy conversion win) if the shop uses one
4. **Checkout:** the "Checkout" button sends the customer to Shopify's `checkoutUrl`. Done. Shopify
   handles payment, taxes, shipping, Klarna/Afterpay, order confirmation email.
5. **Edge cases:** variant sold out between add and checkout, cart older than Shopify keeps it
   (recreate), quantity above available stock.

**What you learn:** Next.js server actions, mutations vs queries in GraphQL, optimistic UI,
cookies and state that survives reloads, why you don't rebuild checkout.

**Definition of done**

- [x] Add, update quantity, and remove all work and update the subtotal
      (`CartDrawer` + cookie-backed server actions; verified against the live Cart API)
- [x] Cart survives a hard refresh and is shared across tabs (Shopify `cartId` in an httpOnly
      cookie, re-read on mount)
- [x] "Checkout" lands on Shopify's checkout with the right items and quantities
      (`cart.checkoutUrl` — note: points at the custom domain, see CLAUDE.md M5 caveat)
- [~] A completed test order (Shopify Bogus Gateway) appears in Shopify admin — **not done**;
  requires enabling the Bogus Gateway in Shopify admin and a manual run through checkout
- [x] Adding a sold-out variant is prevented (button disabled from `availableForSale`); low-stock
      is surfaced after the fact via Shopify `warnings` in the drawer (public token can't read
      quantities up front — see M1 gotcha)

---

## Milestone 3 — Customer accounts and content

**Goal:** customers can log in to see past orders; the brand's story and editorial content have a
home.

**Why it matters:** jewelry brands sell trust and story. Repeat customers are the margin. And
guest checkout must still work — never force an account.

**What you build**

1. **Accounts** via the Shopify **Customer Account API** (their newer OAuth-based system):
   - Login / logout / "magic link" or code sign-in
   - `/account` — profile, order history, order detail, addresses
   - Guest checkout stays the default; account is optional
2. **Content** — choose one:
   - **Simple:** Shopify metaobjects + the online-store blog via the Storefront API. No new service.
   - **Richer:** a headless CMS (Sanity is the common headless-Shopify pairing). More power for
     lookbooks and campaigns, another account to manage. Recommended only if the owner will
     publish content regularly.
   - Pages to build regardless: `/about` (the story), `/journal` (blog), `/pages/[handle]`
     (shipping, returns, care, sizing), FAQ
3. **Legal pages:** privacy policy, terms of service, returns policy, cookie/consent notice
   (Florida + selling nationwide — get these right). Templates are fine; have the owner review.

**What you learn:** OAuth login flows, protected routes, session handling, content modelling,
the build-vs-buy tradeoff for a CMS.

**Definition of done**

**Split:** M3a (content + legal) done; M3b (customer accounts) deferred post-launch — accounts
aren't a launch blocker (Shopify's hosted account pages still work), and the Customer Account API
needs Shopify admin OAuth config.

- [~] A customer can sign in and see a real past order — **M3b, deferred**
- [~] Signing out clears the session; `/account` redirects to login — **M3b, deferred**
- [x] Guest checkout is unaffected (no account gate exists)
- [x] About, journal, and all policy pages are live and linked in the footer
      (`/pages/[handle]`, `/policies/[handle]`, `/journal`; content pulled from Shopify admin)

---

## Milestone 4 — Search, merchandising, polish

**Goal:** customers can find products fast; the site feels finished.

**Why it matters:** "I can't find it" is lost revenue. Polish is the difference between "a dev
project" and "a store".

**What you build**

1. **Search & filtering:**
   - Start with Shopify's **Search & Discovery** app (free) — it powers `search()` and filter
     facets through the Storefront API. Covers most needs.
   - Search page with query, filter by metal / price / availability / collection, sort
   - Predictive search dropdown in the header
   - Only reach for Algolia / Meilisearch if you outgrow Shopify's search (unlikely at this size)
2. **Merchandising:** related products, "complete the set", recently viewed (localStorage),
   wishlist (Customer Account API metafields or localStorage for guests)
3. **Reviews:** integrate a reviews app (Judge.me, Okendo) via its API, or Shopify product-review
   metaobjects. Show rating on PDP and collection cards.
4. **Polish pass:**
   - Consistent spacing, typography scale, focus states, hover states
   - Empty states, error states, 404/500 pages
   - Micro-interactions: add-to-cart animation, drawer transitions
   - Mobile nav, sticky add-to-cart on mobile PDP

**What you learn:** faceted search UX, URL state (filters live in the query string), integrating
third-party APIs, the long tail of "done".

**Definition of done**

- [ ] Searching "gold hoops" returns relevant results with working filters
- [ ] Filters and sort are shareable via URL and survive refresh
- [ ] Wishlist works for both guests and logged-in customers
- [ ] Reviews show on PDPs
- [ ] Every page has a designed empty/error state

---

## Milestone 5 — Launch

**Goal:** the storefront replaces `preciousjewels.co` for real customers, with monitoring so you
know if something breaks.

**Why it matters:** launch is a checklist, not an event. Do it methodically.

**What you build / set up**

1. **SEO:**
   - Per-page `<title>`/`<meta>` via Next.js Metadata API, Open Graph images
   - `sitemap.xml` and `robots.txt` (Next.js generates these)
   - JSON-LD structured data: `Product`, `Offer`, `BreadcrumbList`, `Organization`
   - 301 redirects from old Shopify theme URLs to new ones (map them before launch)
2. **Performance:** Lighthouse ≥ 90 on all core pages, images sized correctly, fonts
   `display: swap`, no blocking third-party scripts, cache headers reviewed
3. **Accessibility:** keyboard-navigable, visible focus, alt text on all product images, colour
   contrast AA, `axe` DevTools clean, test with VoiceOver/NVDA once. (This is also legal risk
   mitigation for US e-commerce.)
4. **Analytics:** GA4 or Plausible; Shopify's own analytics still works for orders. Track the
   funnel: product view → add to cart → checkout start.
5. **Monitoring:**
   - Sentry for JS errors (frontend + server)
   - Vercel Analytics / Speed Insights
   - An uptime monitor (UptimeRobot, free) on the homepage and a product page
6. **Domain cutover:**
   - Point `preciousjewels.co` DNS at Vercel (or use Shopify Oxygen)
   - Keep Shopify's checkout on `checkout.shopify.com` or a `checkout.` subdomain
   - Test a real £X order end to end with a real card, then refund it
7. **Pre-launch checklist** (put this in `docs/launch-checklist.md` and tick it live):
   - [ ] All test orders removed, real inventory correct
   - [ ] Klarna/Afterpay show at checkout
   - [ ] Confirmation + shipping emails send and look right
   - [ ] Tax calculates correctly for FL and out-of-state
   - [ ] Mobile checkout tested on a real phone
   - [ ] 404s and redirects verified with a crawl (Screaming Frog free tier)
   - [ ] Owner can still use Shopify POS at pop-ups (unaffected, but confirm)

**Code done** (in-repo): `sitemap.xml` + `robots.txt`, JSON-LD (`Product`/`Offer`/`BreadcrumbList`/
`Organization`), canonical URLs, old-theme redirects, skip link + focus rings, per-page metadata,
`SHOPIFY_CHECKOUT_DOMAIN` override, Vercel Analytics + Speed Insights, env-gated Sentry. Full
operator runbook: [docs/launch-checklist.md](docs/launch-checklist.md).

**Definition of done** (operator, at cutover)

- [ ] `preciousjewels.co` serves the new storefront (DNS → Vercel; remove from Shopify domains;
      set `SHOPIFY_CHECKOUT_DOMAIN` to the host checkout resolves to)
- [ ] A real customer order completes and appears in Shopify with correct tax + shipping
- [ ] Sentry is receiving events; you get an alert on a test error (add `NEXT_PUBLIC_SENTRY_DSN`)
- [ ] Search Console shows the sitemap accepted, no coverage errors

---

## Milestone 6 — Wholesale / B2B portal (Phase 2, new repo)

**Goal:** approved wholesale buyers log into a private portal, see trade pricing, and place orders
that flow into Shopify for fulfilment.

**Why it matters:** the business already does wholesale (Instagram highlights confirm it). Shopify's
native B2B is Plus-only (~$2,000/mo). A custom portal is a legitimate build — and it's the right
place for Python.

**Why Django here (and not in Phase 1):** this is a real application with its own database —
buyer accounts with approval state, custom price lists, minimum order quantities, net-30 terms,
reorder-from-history, PDF invoices, sales-rep assignment, reporting. Django + DRF + Postgres is a
strong fit and gives you a backend portfolio piece with genuine domain logic.

**Architecture**

```
  Wholesale buyer ──▶ Next.js (or Django templates) portal UI
                          │  REST
                          ▼
                     Django + DRF + Postgres  ◀── sales rep / admin (Django admin)
                          │  Shopify Admin API
                          ▼
                     Shopify: creates draft orders → orders
                     (inventory, fulfilment, shipping stay unified with retail)
```

**What you build**

1. Django project, split settings (`django-environ`), Postgres, Docker for local dev
2. Models: `Company`, `BuyerAccount` (with `status`: pending/approved/suspended), `PriceList`,
   `PriceListItem`, `WholesaleOrder`, `OrderLine`, `Terms`
3. **Onboarding flow:** buyer applies → admin reviews in Django admin → approval email with a
   set-password link
4. **Catalog with trade pricing:** pull products from Shopify Admin API, overlay the buyer's price
   list, enforce MOQs and case packs
5. **Ordering:** build order → submit → Django creates a **draft order** in Shopify via the Admin
   API → owner reviews and converts to a real order in Shopify (so fulfilment, inventory, and
   shipping are the same pipeline as retail)
6. **Account area:** order history, reorder, downloadable PDF invoices, line-sheet PDF export
7. **Auth:** Django's auth + a proper password reset; consider `django-allauth`. Rate-limit login.
8. **Tests:** `pytest-django`, `factory_boy`, aim for meaningful coverage on the pricing engine
   and the Shopify sync (mock the Admin API)
9. **Deploy:** Render or Fly.io (managed Postgres), background worker for Shopify sync + emails
   (Celery or Django-Q2), Sentry, backups, a staging environment

**Definition of done**

- [ ] A buyer can apply, be approved, log in, and see their trade prices (not retail)
- [ ] Submitting an order creates a matching draft order in Shopify admin
- [ ] MOQs and case-pack rules are enforced with clear errors
- [ ] Invoices download as PDFs
- [ ] The pricing engine has tests covering tiered discounts and edge cases

---

## Ongoing — Portfolio packaging

Do this _as you go_, not at the end. It's what turns "I made a website" into evidence of skill.

- **README** with an architecture diagram, the stack and why, a live link, and screenshots
- **`docs/decisions/`** — short Architecture Decision Records for every real fork (why headless,
  why Next.js, why defer Django, why draft orders for wholesale). You already have the first three.
- **`docs/architecture.md`** — kept current as the system grows
- **Clean git history** — small, focused commits with real messages; work on branches; PRs even
  solo (they're your changelog)
- **CI badge**, test coverage badge
- **A seeded demo mode** or a public staging URL so anyone can click around
- **One written deep-dive** (blog post or long README section) on a genuinely hard problem you
  solved. Best candidates: cart state that survives across tabs and Shopify's cart expiry; the
  wholesale pricing engine; the variant-availability matrix on the PDP. "Here's a bug that took me
  a day and what I learned" reads better than a feature list.
- **A 3–5 minute Loom** walking through the architecture

---

## Appendix A — Stack reference

| Concern                     | Choice                              | Notes                                          |
| --------------------------- | ----------------------------------- | ---------------------------------------------- |
| Storefront framework        | Next.js 15+, App Router, TypeScript | Biggest community; most transferable           |
| Styling                     | Tailwind CSS + shadcn/ui            | Current default combo                          |
| Shopify client              | `@shopify/storefront-api-client`    | Official, typed                                |
| Hosting                     | Vercel (or Shopify Oxygen)          | Both have free tiers; Oxygen is Shopify-native |
| Commerce backend            | Shopify Storefront API (GraphQL)    | The anchor decision                            |
| Customer auth               | Shopify Customer Account API        | Their newer OAuth system                       |
| Search                      | Shopify Search & Discovery app      | Upgrade to Meilisearch/Algolia only if needed  |
| Reviews                     | Judge.me or Okendo                  | Via their API                                  |
| Error tracking              | Sentry                              | Frontend + server                              |
| Analytics                   | Plausible or GA4                    | Plus Shopify's built-in order analytics        |
| Wholesale backend (Phase 2) | Django + DRF + Postgres             | Own repo, own deploy                           |
| Wholesale hosting           | Render or Fly.io                    | Managed Postgres, background workers           |

## Appendix B — Known gotchas

- **Shopify cart IDs expire.** Handle "cart not found" by creating a fresh cart and telling the user.
- **Storefront API rate limits** are cost-based, not request-based. Batch queries; cache with ISR.
- **Metafields must be exposed to the Storefront API** explicitly in admin, or queries return null.
- **`next/image` needs your Shopify CDN domain** allow-listed in `next.config.js`.
- **Variant combinations**: a product with metal × size can have "gaps". Query `quantityAvailable`
  and `availableForSale` per variant and reflect it in the UI.
- **Don't rebuild checkout.** Every hour spent there is an hour Shopify already spent, better.
- **Test mode**: enable Shopify's Bogus Gateway for test orders; disable before launch.
- **Redirects**: crawl the current Shopify site _before_ cutover to capture every URL to redirect.
- **`SHOPIFY_STORE_DOMAIN` must be the `*.myshopify.com` domain, never the production/custom
  domain.** `preciousjewels.co` gets repointed to Vercel at the M5 cutover — using it here would
  make the storefront fetch product data from itself instead of Shopify.
- **`npx tsc --noEmit` fails on a fresh checkout** with `Cannot find name 'LayoutProps'` until
  `.next/types` exists. Run `npx next typegen` (or `next build`/`next dev`) first — CI does this
  before typechecking; do the same locally after a clean clone or `.next` deletion.
- **Getting a Storefront API token no longer means creating a custom app.** As of Jan 2026,
  Shopify moved app dev to the Dev Dashboard; for Storefront-only access, install the **Headless**
  channel from the Shopify App Store and click **Create storefront** instead (see M0 step 3). The
  Dev Dashboard's `client_credentials` grant (`/admin/oauth/access_token`) issues an **Admin API**
  token, not a Storefront one — don't use it for this.

## Appendix C — Rough sequencing

This is not a deadline, just an order and relative size. Adjust to your pace.

| Milestone             | Relative effort | Depends on                                |
| --------------------- | --------------- | ----------------------------------------- |
| M0 Foundations        | S               | —                                         |
| M1 Catalog            | L               | M0                                        |
| M2 Cart & checkout    | M               | M1                                        |
| M3 Accounts & content | M               | M2                                        |
| M4 Search & polish    | M               | M1                                        |
| M5 Launch             | M               | M2, M3, M4                                |
| M6 Wholesale portal   | L               | M5 (or start earlier as a parallel track) |

Ship M0–M2 to a real URL before worrying about M4 polish. A working "browse and buy" beats a
beautiful catalog with no cart.
