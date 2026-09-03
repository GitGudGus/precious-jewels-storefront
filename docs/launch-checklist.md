# Launch checklist — Milestone 5

The **code** for launch prep is in the repo (SEO, redirects, analytics, error monitoring, the
checkout-domain override). This document is the **operator runbook** — the parts that happen in
Shopify admin, at the DNS registrar, and with a real card. Tick items live.

---

## 0. The checkout domain — read this first

A headless storefront and Shopify checkout **cannot** run on the exact same domain. The standard
pattern: the storefront takes `preciousjewels.co` + `www`, and checkout runs on a **`checkout.`
subdomain** that stays pointed at Shopify.

Today `cart.checkoutUrl` comes back as `preciousjewels.co/cart/c/…` (Shopify's primary domain). The
moment `preciousjewels.co` DNS points at Vercel, that URL would 404. The fix has two halves:

**In Shopify admin** (Settings → Domains):
1. Connect a new domain: `checkout.preciousjewels.co`. Shopify will give you a CNAME target
   (usually `shops.myshopify.com`).
2. Set `checkout.preciousjewels.co` as the **primary domain**.
3. **Do not remove** `shop-precious-jewels.myshopify.com` — it backs `SHOPIFY_STORE_DOMAIN` (the
   Storefront API) and the checkout fallback.

**In this repo / Vercel:**
4. Set env var `SHOPIFY_CHECKOUT_DOMAIN=checkout.preciousjewels.co` in the Vercel project
   (Production + Preview). `normalizeCheckoutUrl` in `src/lib/shopify/reshape.ts` rewrites every
   `checkoutUrl` host to this value. Leave it **unset until the subdomain above exists.**

**Verify** (after 1–4, before the apex DNS switch): add an item to the cart on the Vercel preview,
click Checkout → must land on `https://checkout.preciousjewels.co/…` and load Shopify's checkout,
not redirect or 404.

---

## 1. Pre-cutover (do these days before, in any order)

### Shopify admin
- [ ] Bogus Gateway disabled / real payment provider live; Klarna & Afterpay enabled and
      **visible at checkout** (test on the preview via the `checkout.` domain).
- [ ] All **test orders deleted**; inventory counts correct; nothing accidentally set to "continue
      selling when out of stock" that shouldn't be.
- [ ] Terms of Service and Shipping Policy have real text (Settings → Policies) — the
      `/policies/*` pages render whatever's there.
- [ ] Order confirmation + shipping-notification emails reviewed (Settings → Notifications) — logo,
      from-address, links point at `preciousjewels.co`.
- [ ] Tax: Settings → Taxes — Florida nexus set; spot-check tax on a FL address vs an out-of-state
      address at checkout.
- [ ] `checkout.preciousjewels.co` connected + set primary (see §0); `SHOPIFY_CHECKOUT_DOMAIN`
      set in Vercel.
- [ ] Confirm the owner can still take payments in **Shopify POS** at pop-ups (unaffected by
      headless, but confirm before launch day).

### Vercel
- [ ] Production env vars present: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`,
      `SHOPIFY_CHECKOUT_DOMAIN`, and (optional) `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`.
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
      shows the exact records needed.
- [ ] At the registrar: point apex + `www` at Vercel (A/ALIAS/ANAME per Vercel's instructions);
      leave the `checkout` CNAME → Shopify untouched.
- [ ] Wait for propagation (minutes at 300s TTL). Vercel domain status → "Valid Configuration".

## 3. Verify live (immediately after)

- [ ] `https://preciousjewels.co/` loads the new storefront (hard refresh / incognito).
- [ ] A PDP loads; add to cart; drawer opens; **Checkout → `checkout.preciousjewels.co`**, Shopify
      checkout loads.
- [ ] **Place one real order with a real card**, complete it, confirm it appears in Shopify admin
      with correct **tax + shipping**, then **refund it**.
- [ ] Confirmation email received and looks right.
- [ ] `https://preciousjewels.co/robots.txt` and `/sitemap.xml` load and reference the real domain.
- [ ] A few old URLs 301/308 correctly (`/blogs/news`, a known old blog post, `/cart`).
- [ ] Sentry shows nothing alarming from real traffic.
- [ ] Submit `https://preciousjewels.co/sitemap.xml` in **Google Search Console** (add the property
      first if needed); request indexing for the homepage.

## 4. Rollback (if checkout or the site is broken and not fixable in ~15 min)

- [ ] At the registrar: revert apex + `www` to the **old Shopify DNS records** (write them down
      here *before* cutover: `__________`).
- [ ] In Shopify admin: set `preciousjewels.co` back to primary if it was changed.
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
