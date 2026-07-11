# Legacy Codebase Audit

Audit of `all-take-out-software.rar` received from the previous developer (Exceed North) on July 11, 2026. Source archived in [`legacy/`](../legacy/) with secrets removed.

## Architecture (what they built)

Three separate deployables, all talking to one **MongoDB** database:

1. **Backend** — three Vercel serverless "microservices" (auth-module, category-module, product-module). Auth-module also contains cart, orders and Stripe checkout endpoints.
2. **User storefront** — Next.js 14 on a MUI admin-dashboard template, with the sticker customizer built in **react-konva** (Konva canvas).
3. **Admin dashboard** — second Next.js app (the `all-take-out-website-*.vercel.app` login Hasan had), same template family.

## What actually works and is worth knowing

- **The Konva customizer** (`legacy/frontend-user-nextjs/src/app/components/shared/Customizer.jsx` + `customizer-components/`): text (fonts/resize/rotate, curved text via TextPath), image upload, clipart, QR controls, layers panel, preview modal. Feature-equivalent to our Fabric.js editor.
- **⭐ PSD export** — they used `ag-psd` to export the design as a **layered Photoshop file** for production. This is genuinely valuable for a print shop and our WordPress plugin doesn't do it yet. Recommended as v1.1: we already store full layered JSON, so adding a PSD/print-file download in the ATO Designs admin panel is straightforward.
- **Pricing model** — products have `basePrice` plus **per-option price modifiers** (each material/size/shape/template can add a fixed amount or percentage), and **dual USD/CAD prices** (`src/utils/pricing.js`). Our WooCommerce build prices per quantity tier instead. Two client questions fall out of this:
  1. Does Stephen want option-based price modifiers (e.g. vinyl +20%)? (Easy to add to our product tab.)
  2. One currency or both? (WooCommerce = one currency natively; CAD is set on the demo.)
- **Coupon codes** — cart items carry a `couponCode` field. WooCommerce gives us coupons for free, so this is covered.
- **Guest carts** — session-ID based guest carts, matching the guest-checkout requirement (WooCommerce also covers this).

## What was broken, fake, or missing in the legacy build

| Issue | Detail |
|---|---|
| **Stripe was never live** | A **test-mode** secret key is **hardcoded in source** (`api/stripe/checkout.js`, now redacted). Checkout literally validates that you provide "a Stripe test token". No live payment was ever possible. Charges hardcoded to USD. |
| **VIP was admin-manual** | VIP users are created only by an admin API (`create-vip-user.js`). The client's required flow — self-serve account creation at checkout → automatic VIP — was not implemented. |
| **No 50-sticker credit** | No field, model or logic for the complimentary stickers anywhere in the codebase. |
| **Single-product orders** | The Order model holds exactly one product per order — a multi-item cart can't check out correctly. |
| **Placeholder assets everywhere** | The "logo" files are from an unrelated project ("Northern Institute for Strategic Innovation", template default logos) and the product photos are stock book-cover images. **No real All Take Out branding exists in this handoff.** |
| **Security smells** | CORS `*` on every endpoint, JWT fallback secret `"dev_secret_key"`, DB clear endpoint (`admin/clear-db.js`), credentials in committed `.env` files. |
| **Two conflicting Product schemas** | auth-module and category-module define different `Products` models against the same collection. |

## The database (important)

All modules point to one MongoDB (connection string in the RAR's `.env` files — **kept out of this repo**, they live only in `Desktop\all-take-out-software.rar` on Hasan's machine). That database holds whatever real categories, products, users, carts (with saved designs) and orders exist.

**Recommended next step:** export it before it disappears — the developer may decommission the cluster. MongoDB Compass (free GUI, no terminal) + the URI from the `.env` → export each collection to JSON. Ask Hasan/Claude to do this while the cluster is still up.

## Feature comparison: legacy vs. our WordPress build

| Client requirement | Legacy (Vercel) | WordPress rebuild |
|---|---|---|
| WordPress platform | ❌ separate apps | ✅ native |
| Config wizard (template/material/size/shape/qty) | ✅ | ✅ |
| Canvas editor (text/image/clipart/QR/layers) | ✅ Konva | ✅ Fabric.js |
| Guest checkout | ✅ | ✅ |
| VIP at checkout + 50 stickers | ❌ | ✅ |
| Live Stripe payments | ❌ test-only | ✅ (official gateway, needs Stephen's keys) |
| Admin design review + edit history | partial (view) | ✅ with edit log |
| Production notification email | ❌ not found | ✅ |
| Order logs | partial | ✅ (WooCommerce notes) |
| PSD export for production | ✅ | ⏳ recommended v1.1 |
| Dual USD/CAD pricing | ✅ | ⏳ decision needed |
| Option-based price modifiers | ✅ schema | ⏳ decision needed |

## Still missing from the developer handoff

1. **Stripe** — only a test key existed; Stephen needs his own Stripe account connected (nothing to migrate).
2. **Real brand assets** — logo, template artwork, product photography. Not in this archive. Ask Stephen directly; the developer never had them.
3. **MongoDB data export** (or confirmation the DB is empty/test-only) — see above.
4. **Domain** — nothing in the handoff references a production domain.
5. **Hostinger/WordPress admin access** for the existing content site (aqua-viper) — separate from this code.
