# 0001 — Use headless Shopify, not a full custom store

**Date:** 2026-09-03
**Status:** Accepted

## Context

Precious Jewels is a real, operating business. It already has a Shopify store at
`preciousjewels.co` (currently in maintenance mode), uses Klarna/Afterpay, sells at in-person
pop-ups, and runs a wholesale side. The owner also wants a strong custom-built web presence, and
the developer wants portfolio value from the project.

The original roadmap assumed a greenfield custom Django store replacing Shopify entirely.

## Options considered

1. **Full custom store** (replace Shopify) — highest portfolio value, but the developer becomes
   permanently responsible for PCI compliance, checkout conversion, BNPL integrations, sales tax,
   fraud screening, shipping labels, and loses the Shopify POS used at pop-ups. Unacceptable risk
   for a business actively taking orders.
2. **Headless** — Shopify remains the commerce backend (checkout, payments, inventory, POS, tax);
   the developer builds and hosts the entire customer-facing storefront against the Shopify
   Storefront API.
3. **Companion app only** — keep the Shopify theme, build a separate custom app for something
   Shopify does poorly (e.g. wholesale). Lowest risk, but doesn't give the owner the new storefront
   they want.

## Decision

**Option 2 — headless.** The storefront is fully custom (design, performance, SEO, content, cart
UX); everything money- or compliance-related stays on Shopify. Wholesale becomes a Phase 2
companion app (combining the best of options 2 and 3).

## Consequences

- The developer builds a substantial full-stack project without owning payments or compliance.
- The business keeps a checkout that already works, plus Shopify POS for pop-ups.
- Real lock-in to Shopify as the commerce backend — accepted deliberately; it's the safe choice
  and the Storefront API is a conventional GraphQL commerce API.
- The storefront must be built so Shopify access is isolated (see 0002, 0003).
