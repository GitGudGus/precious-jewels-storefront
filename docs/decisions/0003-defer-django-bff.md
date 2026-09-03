# 0003 — No Django backend-for-frontend in Phase 1

**Date:** 2026-09-03
**Status:** Accepted

## Context

An earlier idea was to put a Django (DRF) backend-for-frontend (BFF) between the Next.js storefront
and Shopify from the start, partly to keep Python in the architecture.

## Why a BFF is not needed for the Phase 1 storefront

- **Secrets:** the Storefront API has a _public_ access token designed to be exposed in the
  browser. There is nothing to proxy or hide.
- **SSR / SEO / caching:** Next.js does its own server-side rendering, incremental static
  regeneration, and data caching. That is the framework's core job.
- **Content:** jewelry product attributes fit in Shopify metafields; editorial fits in Shopify
  metaobjects or (if needed) a headless CMS — neither requires a custom service.
- **Search:** Shopify's Search & Discovery app exposes search and facets through the Storefront
  API.

Adding Django now would mean two languages, two deployments, auth between the services, and double
the surface area — to solve problems that don't exist yet.

## Decision

**Defer Django to Phase 2.** The Phase 1 storefront talks directly to the Shopify Storefront API.
Python enters with the wholesale/B2B portal (Milestone 6), which is a genuine backend application
with its own database and domain logic (buyer approval, trade pricing, MOQs, invoices).

## Revisit if

- The storefront needs server-side logic that can't live in Next.js route handlers / server
  actions (unlikely).
- A second consumer of the same data appears (e.g. a native app) — a shared BFF might then pay off.

## Consequences

- Faster path to a live storefront; less for a beginner to hold in their head.
- Clean seam preserved: if a BFF is ever justified, it slots in behind `lib/shopify/` with the
  storefront barely changing.
