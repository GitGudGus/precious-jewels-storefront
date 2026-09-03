# Launch checklist — Milestone 5

The **code** for launch prep is in the repo (SEO, redirects, analytics, error monitoring). This
document is the **operator runbook** — Shopify admin, the DNS registrar, a real card. Tick items
live.

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

- [ ] Bogus Gateway disabled / real payment provider live; Klarna & Afterpay enabled and
      **visible at checkout** (verify by checking out on the Vercel preview).
- [ ] All **test orders deleted**; inventory counts correct; nothing accidentally set to "continue
      selling when out of stock" that shouldn't be.
- [ ] Terms of Service and Shipping Policy have real text (Settings → Policies) — the
      `/policies/*` pages render whatever's there.
- [ ] Order confirmation + shipping-notification emails reviewed (Settings → Notifications) — logo,
      from-address, links point at `preciousjewels.co`.
- [ ] Tax: Settings → Taxes — Florida nexus set; spot-check tax on a FL address vs an out-of-state
      address at checkout.
- [ ] Store password removed (Online Store → Preferences) — do this at cutover, not before.
- [ ] Decide the checkout primary domain (§0): `shop-precious-jewels.myshopify.com` (simple) or
      `preciousjewelsmia.com` (branded). **Don't change it yet** — that's a §2 step.
- [ ] Confirm the owner can still take payments in **Shopify POS** at pop-ups (unaffected by
      headless, but confirm before launch day).

### Vercel

- [ ] Production env vars present: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`,
      and (optional) `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`. `SHOPIFY_CHECKOUT_DOMAIN` stays
      **blank** for the `.myshopify.com` option.
- [ ] Latest `main` deployed green to Production.
- [ ] Vercel Analytics + Speed Insights showing data on the current preview URL.

### SEO / content

- [ ] Crawl the **live** `preciousjewels.co` (Screaming Frog free tier, 500 URLs) → export all
      indexed URLs. For anything not covered by `next.config.ts` redirects, add a redirect.
      Known-covered: products, collections, pages, policies; `/blogs/news*` → `/journal*`;
      `/cart`, `/search`. Watch for: old blog/article handles, discontinued product handles,
      `/products/…?variant=` links, `/apps/*`.
- [ ] A real 1200×630 **OG share image** created and added (`src/app/opengraph-image.png` +
      reference it in `layout.tsx` `metadata.openGraph.images`). Also a proper logo for the
      `Organization` JSON-LD (currently points at `favicon.ico`).
- [ ] Lighthouse (mobile) ≥ 90 on the homepage, a collection page, and a PDP — run against the
      Production deployment.
- [ ] `axe` DevTools clean on the same three pages; one pass with VoiceOver.

### Monitoring

- [ ] Sentry project created; `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN` for readable stack
      traces) in Vercel; trigger a test error and confirm it lands in Sentry with an alert.
- [ ] UptimeRobot (free) monitors on `https://preciousjewels.co/` and one PDP — 5-min interval,
      alert to the owner's email/SMS.

---

## 2. Cutover (launch window — pick a low-traffic hour)

- [ ] **1 day before:** lower the TTL on `preciousjewels.co` + `www` DNS records to 300s.
- [ ] In Vercel → project → Domains: add `preciousjewels.co` and `www.preciousjewels.co`. Vercel
      shows the exact records needed. (Don't switch DNS yet — just have the records ready.)
- [ ] Remove the store password (Online Store → Preferences).
- [ ] **Shopify → Settings → Domains: set `shop-precious-jewels.myshopify.com` as the primary
      domain.** This immediately 301s `preciousjewels.co` → `.myshopify.com`, so move fast to the
      next step.
- [ ] At the registrar: point apex + `www` at Vercel (A/ALIAS/ANAME per Vercel's instructions).
- [ ] Wait for propagation (minutes at 300s TTL). Vercel domain status → "Valid Configuration".

## 3. Verify live (immediately after)

- [ ] `https://preciousjewels.co/` loads the new storefront (hard refresh / incognito).
- [ ] A PDP loads; add to cart; drawer opens; **Checkout → `shop-precious-jewels.myshopify.com`
      → `shop.app`**, Shopify checkout loads (no 404, no bounce to `preciousjewels.co`).
- [ ] **Place one real order with a real card**, complete it, confirm it appears in Shopify admin
      with correct **tax + shipping**, then **refund it**.
- [ ] Confirmation email received and looks right.
- [ ] `https://preciousjewels.co/robots.txt` and `/sitemap.xml` load and reference the real domain.
- [ ] A few old URLs 301/308 correctly (`/blogs/news`, a known old blog post, `/cart`).
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

---

## Definition of done (ROADMAP M5)

- [ ] `preciousjewels.co` serves the new storefront
- [ ] A real customer order completes and appears in Shopify with correct tax + shipping
- [ ] Sentry is receiving events; an alert fires on a test error
- [ ] Search Console shows the sitemap accepted, no coverage errors
