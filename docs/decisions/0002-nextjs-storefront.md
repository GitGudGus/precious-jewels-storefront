# 0002 — Build the storefront with Next.js (not Django, not Hydrogen)

**Date:** 2026-09-03
**Status:** Accepted

## Context

With headless Shopify chosen (0001), the storefront needs a framework. The developer is a
beginner. The original roadmap favoured Python/Django. The industry-standard headless-Shopify
storefront is JavaScript/TypeScript.

## Options considered

1. **Next.js (App Router, TypeScript)** — largest community and tutorial base, official Shopify
   client and example repo (`shopify/hydrogen-demo-store` equivalents, Vercel Commerce), strong
   SSR/SEO/image tooling, deploys free on Vercel. React is the most transferable frontend skill.
2. **Shopify Hydrogen** — Shopify's own React framework (built on React Router), deploys free on
   Oxygen, most Shopify-native. Smaller community; fewer answers when stuck.
3. **Django server-rendered + HTMX** — keeps the stack in Python, plays to the developer's
   existing knowledge, but is an unusual choice for headless commerce with far fewer references,
   and still needs JavaScript for cart interactivity.

## Decision

**Option 1 — Next.js.** For a beginner, the deciding factor is support density: when stuck at
11pm, the number of existing answers, tutorials, and example repos for Next.js + Shopify dwarfs
the alternatives. React skills transfer to any future job. Hydrogen remains a viable fallback with
~80% code portability.

## Consequences

- The developer learns React, TypeScript, and the Next.js App Router — all high-value, transferable.
- Python is deferred to Phase 2 (the wholesale portal), where a real backend is warranted.
- Hosting defaults to Vercel; Oxygen stays an option (low switching cost).
- Moderate lock-in to Next.js — mitigated by keeping product/cart logic in framework-agnostic
  modules and all Shopify calls in `lib/shopify/`.
