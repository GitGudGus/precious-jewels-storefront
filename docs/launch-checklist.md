# Launch checklist — Milestone 5

The **code** for launch prep is in the repo (SEO, redirects, analytics, error monitoring). This
document is the **operator runbook** — Shopify admin, the DNS registrar, a real card. Tick items
live.

---

## Where we are (2026-10-01) — read this to pick up

**Everything in §1 (pre-cutover) is done except the optional `axe` / VoiceOver pass.** The owner
paused at the very start of §2. What is left, in order:

1. **§2 step 1 — lower the DNS TTL to 300s and write down the current records.** Instructions
   were given on 2026-10-01; **the owner has not confirmed doing it** — treat it as not done.
2. **Two answers needed from the owner before the switch:** (a) where the DNS for
   `preciousjewels.co` is managed (registrar / Shopify-managed), so the record instructions can be
   exact; (b) the go-live day and a quiet ~30-minute window.
3. **§2 — the cutover**, at least 24 hours after the TTL change.
4. **§3 — verify live**, noting the pre-drop caveats there (no add-to-cart, no real-card order).
5. **§6 — drop day** (late November 2026): flip `DROP_PENDING`, re-publish the catalogue, real-card
   test.

**The site launches in "pre-drop" mode** (owner's plan): 34 teaser products, every one showing
"Coming soon", nothing purchasable, the newsletter form as the only call to action. The site runs
about a month collecting analytics, then the first drop goes live. See §6.

---

## 0. The checkout domain — read this first

Shopify serves checkout from its **primary domain**, and `cart.checkoutUrl` is issued on that
host. Today the primary is `preciousjewels.co`, so checkout URLs are
`preciousjewels.co/cart/c/…`. The instant `preciousjewels.co` DNS points at Vercel (this app),
those URLs 404.

**The fix: at the cutover, change Shopify's primary domain to `shop-precious-jewels.myshopify.com`.**
Then `cart.checkoutUrl` comes back as `shop-precious-jewels.myshopify.com/cart/c/…`, which Shopify
redirects to its own hosted checkout on `shop.app` — a Shopify-controlled domain, unaffected by
the DNS change. **No code change, no `SHOPIFY_CHECKOUT_DOMAIN` needed** (leave it blank; the
`normalizeCheckoutUrl` override in `src/lib/shopify/reshape.ts` is a fallback only).

> More branded alternative: use `preciousjewelsmia.com` as the primary instead (already connected
> in Shopify). Checkout then runs on `preciousjewelsmia.com/…`. Keep that domain's DNS pointed at
> Shopify. Everything below is written for the `.myshopify.com` option.

**⚠️ Timing matters — do this IN the cutover window, not before.** Changing the primary domain
makes Shopify 301-redirect _every_ connected domain (`preciousjewels.co`, `www`,
`preciousjewelsmia.com`) to the new primary. If you do it while `preciousjewels.co` still serves
the current store, customers get bounced to the raw `.myshopify.com` URL and Google starts
re-canonicalising. So: change the primary and switch the DNS back-to-back (steps in §2).

**Never remove `shop-precious-jewels.myshopify.com`** from Shopify's domains — it backs
`SHOPIFY_STORE_DOMAIN` (the Storefront API this whole app runs on).

---

## 1. Pre-cutover (do these days before, in any order)

### Shopify admin

- [~] Bogus Gateway disabled / real payment provider live; Klarna & Afterpay enabled and
      **visible at checkout** (verify by checking out on the Vercel preview). — 2026-09-04:
      Shopify Payments + Afterpay confirmed live in Settings → Payments. Still open: confirm
      **Klarna** (enable it, or decide it's not wanted) and eyeball the payment options actually
      showing on the Vercel-preview checkout. — 2026-10-01: owner believes Klarna is enabled.
      Checkout can't be reached while `DROP_PENDING` blocks add-to-cart, so eyeball the payment
      options during the drop-day real-card test.
- [x] All **test orders deleted**; inventory counts correct; nothing accidentally set to "continue
      selling when out of stock" that shouldn't be. — 2026-09-04: no test orders (this was a real
      operating store before, only real order history); overselling is disabled.
- [x] Terms of Service and Shipping Policy have real text (Settings → Policies) — the
      `/policies/*` pages render whatever's there. — 2026-09-04: policy bodies already written; the
      Policies tab's **Contact information** and **Legal notice** fields were the only gaps —
      values handed to the owner (`preciousjewelsmia@gmail.com`; `Precious Jewels`, `1768 NW 20th
      Street, Miami, FL 33142`). — 2026-10-01: owner confirmed policies are up to date.
- [x] Newsletter signup creates a **Subscribed** customer in Shopify admin. — 2026-10-01: owner
      tested a real signup on the preview; works.
- [x] Launch catalogue curated: 34 teaser products on the **Headless** channel only (removed from
      every other sales channel), all showing "Coming soon" via `DROP_PENDING`. — 2026-10-01.
- [x] Order confirmation + shipping-notification emails reviewed (Settings → Notifications) — logo,
      from-address, links point at `preciousjewels.co`. — 2026-09-04: owner confirmed correct.
- [x] **Checkout branding → Guava.** Settings → Checkout → Customize (checkout editor). Set the
      primary/action button + accent colour to `#b1462c` (matches the storefront's `accent-deep`
      CTAs; AA on the white checkout ground). The Shopify-hosted checkout keeps its own styling —
      this is the only place to bring it in line with the site. (2026-09-10: owner flagged the
      "Pay now" button still looks like default Shopify.) — 2026-10-01: owner set the checkout
      colours in the checkout editor.
- [x] Tax: Settings → Taxes — Florida nexus set; spot-check tax on a FL address vs an out-of-state
      address at checkout. — 2026-09-04: owner confirmed "tax looks good."
- [ ] Store password removed (Online Store → Preferences) — do this at cutover, not before.
      (2026-09-04: briefly removed by accident while checking Payments — exposed the *old* Shopify
      theme, since DNS still points at Shopify; re-enabled within minutes. Confirms the old theme
      is still the published Online Store, and that removing the password early makes it publicly
      orderable. Keep it on until the §2 window.)
- [x] Decide the checkout primary domain (§0): `shop-precious-jewels.myshopify.com` (simple) or
      `preciousjewelsmia.com` (branded). **Don't change it yet** — that's a §2 step. — going with
      `shop-precious-jewels.myshopify.com`.
- [x] Confirm the owner can still take payments in **Shopify POS** at pop-ups (unaffected by
      headless, but confirm before launch day). — 2026-10-01: the owner had removed every product
      from every sales channel except Headless while curating the teaser catalogue, which would
      have emptied the POS app too. All products are back on the **Point of Sale** channel; the
      website still sees only the 34 Headless products (verified via the Storefront API).

### Vercel

- [x] Production env vars present: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`,
      and (optional) `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`. `SHOPIFY_CHECKOUT_DOMAIN` stays
      **blank** for the `.myshopify.com` option. — 2026-09-04: both Shopify vars present; both
      Sentry vars added this session; `SHOPIFY_CHECKOUT_DOMAIN` left blank.
- [x] Latest `main` deployed green to Production. — 2026-09-04.
- [x] Vercel Analytics + Speed Insights showing data on the current preview URL. — 2026-10-01:
      owner confirmed both tabs show data.

### SEO / content

- [ ] ~~Crawl the live `preciousjewels.co` pre-launch~~ — **deferred to post-launch** (decision
      2026-09-04): the site is password-protected again, so a real crawl needs either a brief
      deliberate password removal or an already-verified Search Console property, neither in place
      right now. Known-common cases are already covered in `next.config.ts` (products, collections,
      pages, policies; `/blogs/news*` → `/journal*`; `/cart`, `/search`), so the risk of deferring
      is narrow: long-tail URLs (old blog/article handles, discontinued product handles,
      `/products/…?variant=` links, `/apps/*`) may 404 briefly post-launch until caught by Search
      Console Coverage (§5) and patched.
- [x] A real 1200×630 **OG share image** created and added (`src/app/opengraph-image.png`, picked
      up automatically by Next's file convention; `layout.tsx` also carries explicit
      `openGraph`/`twitter` title+description). Built from the brand wordmark (source:
      `preciousjewelsmia` Instagram profile pic / user-provided screenshot) composited onto the
      site's cream `--color-bg`. Also `public/logo.png` (transparent wordmark) wired into the
      `Organization` JSON-LD `logo` field, replacing the `favicon.ico` placeholder.
- [x] **Customer accounts (hosted) wired for launch** — 2026-09-09. Store is on Shopify's new
      passwordless accounts; "Account" links (header + footer) point at `/account`, which
      `next.config.ts` redirects to the hosted portal. Old theme deep links (`/account/orders`
      etc.) covered too. Native Moonstone `/account` stays deferred to M3b. Verify the redirect
      chain live in §3.
- [x] Lighthouse (mobile) ≥ 90 on the homepage, a collection page, and a PDP — run against the
      Production deployment. Verified locally (`next build` + `next start`) 2026-09-04/05, two real
      bugs found and fixed:
      - Homepage was 89 (LCP 3.5s, 2.79s of it "element render delay") — the hero's `<Reveal>`
        scroll-fade wrapper was gating the H1's first paint behind JS hydration + an
        IntersectionObserver callback + a 600ms transition, for content that's already in the
        initial viewport and never actually needs to be "revealed". Removed `Reveal` from the hero
        only (`src/app/page.tsx`); other sections keep it. → 99.
      - PDP was 89 (LCP 3.7s) — `ProductGallery`'s main image used the deprecated `priority` prop
        (Next.js 16 renamed it to `preload`; see `node_modules/next/dist/docs/.../image.md`), which
        inserts a `<link rel=preload>` but — per that same doc — doesn't set `fetchpriority=high`.
        Replaced with `loading="eager"` + `fetchPriority="high"` (the docs' own recommendation for
        a genuine single LCP image) on `src/components/product/ProductGallery.tsx`. → 96.
      - Collection page: 93, no changes needed.
      **Re-run 2026-10-01** after the photo hero / pre-drop work (mobile, simulated throttling):
      - Production URL, before fixes: homepage 81, collection 84, PDP 86; accessibility 91–96.
      - Fixed: first row of collection cards now `loading="eager"` (the LCP card image was lazy —
        1.2s of load delay); cart drawer gets `inert` while closed (focusable content inside
        `aria-hidden`); `/account` links `prefetch={false}` (the off-site redirect logged a CORS
        console error on every page); accent tint lightened to `#f9e8e0` (outline button was
        4.48:1); heading order (value props → `h2`, sr-only `h2` above the collection grid).
      - Local `next start`, after fixes: homepage 90 (85 on a cold image cache), collection 95,
        PDP 90; **accessibility 100** on all three; SEO 100. The homepage LCP is now the hero
        photo (it was the H1 text), simulated at 3.6s — observed LCP is under a second; the
        simulated figure is hydration JS on a 4×-throttled CPU delaying the image paint.
      - Production URL, after those fixes (two runs each): homepage 85–86, collection 87–88,
        PDP 90–91; accessibility / best-practices / SEO **100** everywhere. Every page showed ~2s
        of LCP "element render delay": the Sentry browser SDK was statically imported by
        `instrumentation-client.ts`, so it sat in the main chunk (133k gzipped) ahead of the
        first image paint.
      - Fix (branch `lazy-sentry-client`): load Sentry on `requestIdleCallback` via
        `src/sentry.client.ts`. Main chunk 133k → 72k, Sentry is a 59k chunk fetched after
        paint. Local build with a dummy DSN: homepage 95, collection 94, PDP 98. Trade-off:
        errors in the first second or so of a page load aren't reported.
      - **Production URL with the lazy Sentry client deployed (2026-10-01, two runs each):
        homepage 90 / 90, collection 97 / 98, PDP 98 / 96; accessibility, best-practices and SEO
        100 on all three.** Largest script 73k. The lazily-initialised SDK posted an envelope to
        Sentry's ingest endpoint (HTTP 200) during the run, so init works in production.
      Still worth doing: trigger a deliberate test error and confirm it shows up (and alerts) in
      the Sentry dashboard. The homepage sits right on 90 — the hero photo is its LCP.
- [ ] `axe` DevTools clean on the same three pages; one pass with VoiceOver.

### Monitoring

- [x] Sentry project created; `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN` for readable stack
      traces) in Vercel; trigger a test error and confirm it lands in Sentry with an alert. —
      2026-09-04: Sentry project + org auth token created, both env vars in Vercel (Production +
      Preview), verified end-to-end with a temporary `/sentry-test` throw route on a preview
      deploy — error landed in Sentry as unhandled; route deleted after.
- [x] UptimeRobot (free) monitors on `https://preciousjewels.co/` and one PDP — 5-min interval,
      alert to the owner's email/SMS. (2026-09-04: deferred within this session; Production on
      Vercel is *not* behind deployment protection — only Preview deploys are — so monitoring
      `precious-jewels-phi.vercel.app` now and swapping the URLs to `preciousjewels.co` at cutover
      works fine. Just not set up yet.) — 2026-10-01: two monitors created and "Up":
      `https://precious-jewels-phi.vercel.app/` and `…/products/tiffany`. **At cutover, edit both
      to `https://preciousjewels.co/…`** (it's a §3 step).

---

## 2. Cutover (launch window — pick a low-traffic hour)

- [ ] **1 day before:** lower the TTL on `preciousjewels.co` + `www` DNS records to 300s, and
      **write down / screenshot every existing `@` and `www` record first** (type, name, value,
      TTL) — that's the rollback copy for §4. Change only the TTL; leave the values pointing at
      Shopify. (2026-10-01: instructions given, **not confirmed done**. Still unknown: which
      provider manages the DNS.)
- [ ] In Vercel → project → Domains: add `preciousjewels.co` and `www.preciousjewels.co`. Vercel
      shows the exact records needed. (Don't switch DNS yet — just have the records ready.)
- [ ] Remove the store password (Online Store → Preferences).
- [ ] **Shopify → Settings → Domains: set `shop-precious-jewels.myshopify.com` as the primary
      domain.** This immediately 301s `preciousjewels.co` → `.myshopify.com`, so move fast to the
      next step.
- [ ] At the registrar: point apex + `www` at Vercel (A/ALIAS/ANAME per Vercel's instructions).
- [ ] Wait for propagation (minutes at 300s TTL). Vercel domain status → "Valid Configuration".
- [ ] **Replace the old Online Store theme with a redirect stub.** After cutover, checkout runs on
      `shop-precious-jewels.myshopify.com`, and Shopify's checkout logo links back to that domain's
      Online Store — i.e. the *old theme*. Also any old bookmark / crawler hitting the myshopify
      domain sees the stale theme. Fix: publish a bare theme whose `layout/theme.liquid` is just a
      redirect to `https://preciousjewels.co` + the current path. Shopify serves `/cart/*`,
      `/checkouts/*`, `/account/*` at the platform level (not through the theme), so those flows
      are unaffected — but **test all three after publishing**. (2026-09-10: owner flagged the
      checkout logo bounce. This is the known headless-checkout limitation from the M2 notes; the
      theme stub is the fix.)

## 3. Verify live (immediately after)

- [ ] `https://preciousjewels.co/` loads the new storefront (hard refresh / incognito).
- [ ] Edit both UptimeRobot monitors to `https://preciousjewels.co/` and
      `https://preciousjewels.co/products/tiffany`.
- [ ] Newsletter: sign up with a fresh address on the live domain; it appears as **Subscribed** in
      Shopify admin → Customers.
- [ ] _(Drop day — not possible while `DROP_PENDING` is on; at launch just confirm a PDP loads and
      shows "Coming soon" + the "Get first access to the drop" link.)_ A PDP loads; add to cart;
      drawer opens; **Checkout → `shop-precious-jewels.myshopify.com`
      → `shop.app`**, Shopify checkout loads (no 404, no bounce to `preciousjewels.co`).
- [ ] **Place one real order with a real card** — **moved to drop day** (2026-10-01): nothing is
      purchasable while `DROP_PENDING` is on, so do this right after the flag is flipped. Complete
      it, confirm it appears in Shopify admin
      with correct **tax + shipping**, then **refund it**.
- [ ] Confirmation email received and looks right.
- [ ] `https://preciousjewels.co/robots.txt` and `/sitemap.xml` load and reference the real domain.
- [ ] A few old URLs 301/308 correctly (`/blogs/news`, a known old blog post, `/cart`).
- [ ] `https://preciousjewels.co/account` → Shopify's hosted customer account portal (307 →
      `<myshopify>/account` → the portal). "Account" link in the header + footer works. Log in with
      a test customer, confirm order history + addresses show.
- [ ] Sentry shows nothing alarming from real traffic.
- [ ] Submit `https://preciousjewels.co/sitemap.xml` in **Google Search Console** (add the property
      first if needed); request indexing for the homepage.

## 4. Rollback (if checkout or the site is broken and not fixable in ~15 min)

- [ ] Shopify → Domains: set `preciousjewels.co` back as the primary domain.
- [ ] At the registrar: revert apex + `www` to the **old Shopify DNS records** (write them down
      here _before_ cutover: `__________`).
- [ ] Re-enable the store password if you want to keep working privately.
- [ ] TTL of 300s means recovery in minutes. Debug on the preview, retry later.

## 5. Post-launch (first week)

- [ ] Search Console: watch Coverage for crawl errors / soft-404s; fix redirects as they surface.
- [ ] Vercel Speed Insights: real-user Core Web Vitals — address anything red.
- [ ] Restore DNS TTLs to normal (3600s).
- [ ] Consider GA4 if the owner wants funnel analysis (product view → add to cart → checkout);
      needs a cookie-consent banner.
- [ ] Revisit the deferred items: M3b customer accounts, M4 search, a real contact form,
      newsletter capture, Instagram → journal feed.

## 6. Drop day (late November 2026)

The site is live but in pre-drop mode until this runs. Do it in this order.

- [ ] **Shopify admin:** publish the full drop catalogue to the **Headless** sales channel
      (Products → select → Bulk actions → Include in sales channels → Headless). Check inventory
      counts are right — they were never zeroed, the site just hides availability.
- [ ] **Code (one PR):** set `DROP_PENDING = false` in `src/lib/shopify/constants.ts`, and rewrite
      the hardcoded pre-drop homepage copy in `src/app/page.tsx` (hero eyebrow "Miami · First drop
      November 2026", CTAs "Preview the drop" / "Get first access", "Coming in the drop", the
      newsletter blurb, and the success message in `src/components/newsletter/actions.ts`).
- [ ] **Merge → the deploy is what makes it live.** `dynamicParams = false` means the newly
      published products only get pages on a new build, so the merge must come _after_ the
      catalogue is published. Listings alone would follow within 15 minutes (ISR).
- [ ] Spot-check: a PDP shows "Add to cart"; the drawer opens; **Checkout →
      `shop-precious-jewels.myshopify.com` → `shop.app`** loads.
- [ ] **Place one real order with a real card**, confirm tax + shipping in Shopify admin and the
      confirmation email, check Klarna / Afterpay show as payment options, then refund it.
- [ ] Email the newsletter list (Shopify Email → customers with marketing consent).
- [ ] Decide whether the gift card (currently one of the 34 teaser products) should be on sale.

---

## Definition of done (ROADMAP M5)

- [ ] `preciousjewels.co` serves the new storefront
- [ ] A real customer order completes and appears in Shopify with correct tax + shipping
- [ ] Sentry is receiving events; an alert fires on a test error
- [ ] Search Console shows the sitemap accepted, no coverage errors
