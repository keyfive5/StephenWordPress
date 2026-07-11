# Legacy Codebase Archive (from previous developer)

Source of the original hybrid build, received from Joseph Bennett / Exceed North on **July 11, 2026** as `all-take-out-software.rar`. Archived here for reference — **this code is replaced by the WordPress build** in `wp-content/`.

## What's here

| Folder | What it is |
|---|---|
| `backend-services-nodejs/` | Three Vercel serverless modules (auth, category, product) on MongoDB — includes cart, orders, Stripe checkout |
| `frontend-user-nextjs/` | Customer storefront (Next.js 14 + MUI dashboard template + react-konva customizer) |
| `frontend-admin-nextjs/` | Admin dashboard (same template family) |

## Deliberately removed before committing

- **`.env` files** — they contain the live MongoDB connection string and JWT secret. They exist only in the original RAR on Hasan's machine (`Desktop\all-take-out-software.rar`). Do not commit them.
- **Hardcoded Stripe key** in `backend-services-nodejs/auth-module/api/stripe/checkout.js` — redacted to `STRIPE_KEY_REDACTED_SEE_ENV`. It was a **test-mode** key hardcoded in source (see audit).
- `node_modules/`, `.next/` build output, lockfiles.

## Read the audit

Findings, data model, feature comparison, and what's still missing from the handoff: [docs/LEGACY-AUDIT.md](../docs/LEGACY-AUDIT.md).
