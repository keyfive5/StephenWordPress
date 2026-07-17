# PROJECT STATE — All Take Out (single source of truth)

> Read this first in any new working session. Everything below is current as of **July 17, 2026**.

## What this is

Sticker/label e-commerce platform for **Stephen Wilding / Kew Stick Inc.** ("All Take Out").
People: **Hasan** (keyfive5, builds everything, no terminal — agent does builds/deploys), **Joseph** (project middleman, Exceed North), **Stephen** (client, nitpicky, sends guides as "BP" files), previous dev **Shariyar** (built the legacy system; ownership/handoff incomplete — risk documented).

Agreed direction (Hasan+Joseph call): **hybrid** — WordPress for content/plugins/SEO familiarity + custom code for the customizer/order logic. Meanwhile the **custom edition is the live demo** Stephen reviews.

## The three builds

| Build | Where | Status |
|---|---|---|
| **Custom edition (LIVE DEMO)** | `gh-pages` branch → https://keyfive5.github.io/StephenWordPress/ · source folder `C:\Users\Hasan\Desktop\fable 5\ato-custom\` | Primary. All client feedback lands here first |
| **WordPress build** | `main` branch: `wp-content/themes/alltakeout` (1.0.1) + `wp-content/plugins/ato-customizer` (1.3.0), install zips in `dist/` | Feature-parity engine (editor.js/editor.css/psd-export.js/clipart synced from custom); deploys to any WP host via wp-admin zip upload |
| **Legacy archive** | `main`: `legacy/` (prev dev's Vercel microservices + 2 Next.js apps) | Reference only. Stripe was test-only-hardcoded; VIP unimplemented; DB exported to Hasan's `Desktop\ATO-database-backup\` (test data; only keeper = category tree) |

**Admin demo login** (custom edition `/admin.html`, session-scoped, client-side): `admin@gmail.com` / `12345`.
Old dev's dashboard (same creds): https://all-take-out-website-jf4c.vercel.app/auth/auth1/login — never logged into (agent password policy); fully understood via archived source + DB export instead.
Old WP site: https://aqua-viper-332471.hostingersite.com (no access yet). Hasan has a Hostinger account, **no hosting plan purchased yet** — that purchase is the launch gate for the WP build.

## Custom edition architecture (all static, GitHub Pages, $0)

- **Pages**: index (Stephen's BP #1–#11 blueprint, bundle-led funnel), bundle (Bundle Builder, 20% off, guided 2-step design), shop, product, cart, checkout (3 cases: guest / signup→VIP / VIP), account, admin (login-gated: designs+history, orders+production sheets, One Question results+archives, **Products manager**), vip, making-labels, faqs, one-question (poll), blog ×2.
- **State**: localStorage — `ato_cart`, `ato_designs` (max 8), `ato_orders`, `ato_user`, `ato_bundle` (funnel ctx), `ato_products` + `ato_product_overrides` (dashboard-added products, merged into `ATO_DATA.products` at store.js load), `ato_poll_state` + `ato_poll_archive`, `ato_consent`, sessionStorage `ato_admin_auth`. All API-shaped for launch swap.
- **Editor engine** (`assets/js/editor.js`, ~1100 lines, shared verbatim with WP plugin): config wizard → Fabric.js canvas. **Printable-area mode**: template PNG locked at bottom, white `areabg` rect over the zone (hides baked-in placeholder text; Colour tool recolors it), per-object clipPath to the zone, dashed guide. Classic mode (no template): shape masks. Placeholder text auto-clears on edit + empty-text objects auto-remove. 21 clipart SVGs + search. Pages integrate via **fetch-shim pattern**: page defines `window.atoEditorData` + intercepts `fetch('/ato-local')` → persists via `ATO.saveDesign` (product page) / updates design (admin, numeric-index mapping, `admin.html?design=N` auto-opens).
- **Printable areas**: fractions {x,y,w,h} of the template image, **pixel-measured** from Stephen's PNGs (script: scratchpad `measure_areas.py`; values in `docs/measured-areas.json` on main). Rule per Stephen: zone must touch the black border and the dashed guide lines.
- **Exports** (`assets/js/psd-export.js` + vendor `ag-psd.js`): `atoExportPsd` (layered PSD, one raster layer per element) and `atoExportSvg` (layered SVG, Illustrator-native `<g>` per element, images embedded as data URIs). Both buttons in admin designs tab; same in WP admin design screen.
- **VIP model (BP #7, current)**: 50 extra labels with EVERY regular-priced order + free ground shipping. No credit balance.
- **Poll spec**: one vote/device, largest-remainder rounding (always 100%), "Based on N responses.", chosen answer highlighted, question id change → auto-archive (admin tab shows all).
- **Taxes**: demo per-US-state table in data.js (NY 8.875 etc.), picked at checkout. Currency displayed as USD; CAD/dual-currency decision pending from Stephen.

## Deploy workflows (agent runs these)

- **Live site**: worktree at `C:\Users\Hasan\Desktop\fable 5\ghp2` (checked out on branch `gh-pages`). Steps: `cd ghp2` → `git rm -rq .` → copy `..\ato-custom\*` in → commit → `git push origin gh-pages`. Pages auto-serves in ~1 min (verify: curl for a new string). Folder `ghp-deploy` next to it is junk (locked, delete when possible).
- **WP zips**: `Compress-Archive` theme + plugin folders → `dist/*.zip`, commit main.
- Local preview: launch.json config `ato-custom` (python http.server :8736).

## Client asset inventory (all preserved in repo `client-assets/`)

- `product-graphics/`: 30 original template PNGs (renamed working copies in `ato-custom/assets/templates/`).
- `bp-homepage-guide/`: BP #1–#11 (homepage blueprint; implemented verbatim incl. his 9 FAQs).
- Legacy RAR stays on Hasan's machine (`Desktop\all-take-out-software.rar`, contains `.env` with Mongo URI — never commit).

## Docs index (`docs/`)

CLIENT-REQUIREMENTS.md (spec traceability) · CLIENT-QA-STEPHEN.md (13 answers sent) · LEGACY-AUDIT.md · LEGACY-DATA-CATALOG.md · DEVELOPER-HANDOFF-CHECKLIST.md (with status) · DEPLOYMENT-HOSTINGER.md (WP launch steps) · measured-areas.json · this file.

## Open items

1. **Hosting**: Hasan buys a Hostinger plan → deploy WP build (or keep custom + add real backend). Domain still unowned.
2. **Stripe**: Stephen's own account at launch (legacy had test-key only).
3. **Assets from Stephen**: real logo/brand kit (friend is sending); Adobe Fonts kit ID if wanted (font list = one array in editor config).
4. **Decisions pending from Stephen**: USD vs CAD vs both; per-option price modifiers (vinyl +20%?); 50 VIP labels physical fulfilment detail.
5. Full handoff from prev dev incomplete: domain/hosting ownership, anything beyond the RAR.
6. WP build lags custom on: BP homepage, bundle funnel, admin products manager (WP uses WooCommerce natively for those — by design).

## Bug-fix ledger (why things are the way they are)

- Header `backdrop-filter` removed: it made the header the containing block for the fixed mobile drawer (invisible-menu bug on iOS).
- `.reveal` animation: rescan hook + 1.5s failsafe + skip-when-hidden — content can never stay invisible (was: invisible shop cards).
- Shop/product template imgs: absolute containment + overflow hidden (`.tpl-thumb`) — iOS percentage sizing broke out of cards.
- `.ato-design-summary[hidden]` display fix; rAF-throttling guards in poll count-up; Word-locked README workaround (commit via git index).
- Legacy Next.js apps initially committed as broken gitlinks (nested `.git`) — fixed, 370 files real.
