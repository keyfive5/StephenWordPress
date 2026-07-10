# All Take Out — WordPress Rebuild

Complete WordPress rebuild of the **All Take Out** custom sticker & label platform for **Stephen Wilding / Kew Stick Inc.**, replacing the previous hybrid build (Hostinger WordPress front end + separate Vercel app).

Everything now lives inside WordPress: one site, one admin, no external app.

| Piece | What it is | Where |
|---|---|---|
| **Theme: All Take Out** | The storefront design — home, shop, VIP, Making Labels, FAQs, blog | `wp-content/themes/alltakeout/` |
| **Plugin: ATO Customizer** | The label design editor, VIP program, order/production workflow, admin review panel | `wp-content/plugins/ato-customizer/` |
| **Static design preview** | Open in any browser to demo the design + editor without WordPress | `preview/index.html`, `preview/editor.html` |
| **Docs** | Requirements traceability, deployment guide, developer handoff checklist | `docs/` |
| **Install zips** | Ready-to-upload theme + plugin zips | `dist/` |

## What the platform does

- **Storefront** — 7 label categories (Social Media, QR Code, Promotional, Branded, Tamper-Evident, Customer Appreciation, Food Identification) on WooCommerce.
- **Product configuration** — per product: template, material, size, shape, quantity tiers with per-tier pricing (set in the product's *ATO Customizer* tab).
- **Design editor** — drag-and-drop canvas (Fabric.js): text with curated fonts, logo/image upload, clipart, generated QR codes, background colours, layers, undo/redo, shape-accurate dashed cut line.
- **Orders** — design saved with a unique ref (e.g. `ATO-8F3K2A`), preview PNG + full layered JSON stored, attached through cart → order.
- **Guest + VIP checkout** — guests order freely; creating an account (standalone or during checkout) grants the VIP role, **50 complimentary stickers**, free ground shipping, and a *VIP Benefits* tab in My Account. Credit awards are logged on the order for the production team.
- **Production emails** — on payment, the admin gets a spec sheet: configuration, fonts used, image/QR counts, preview image, link to the design.
- **Admin review panel** — *ATO Designs* menu in wp-admin: browse every design, open it in the same editor the customer used, refine it, with a visible edit history.
- **Payments** — Stripe via the official **WooCommerce Stripe Gateway** plugin (guest + logged-in flows), per the client flow document.

## Quick install (no terminal needed)

1. In wp-admin: **Plugins → Add New** — install & activate **WooCommerce**, then **WooCommerce Stripe Gateway**.
2. **Appearance → Themes → Add New → Upload Theme** — upload `dist/alltakeout-theme.zip`, activate.
3. **Plugins → Add New → Upload Plugin** — upload `dist/ato-customizer.zip`, activate.
4. Follow [docs/DEPLOYMENT-HOSTINGER.md](docs/DEPLOYMENT-HOSTINGER.md) for pages, menus, products and Stripe keys.

## Requirements traceability

Every requirement from the two client documents is mapped to its implementation in
[docs/CLIENT-REQUIREMENTS.md](docs/CLIENT-REQUIREMENTS.md) — useful when walking the client through what's done.

## Getting the old project's assets

Calling the previous developer? Bring [docs/DEVELOPER-HANDOFF-CHECKLIST.md](docs/DEVELOPER-HANDOFF-CHECKLIST.md) — it lists exactly what to ask for, in priority order.
