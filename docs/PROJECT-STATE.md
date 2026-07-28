# PROJECT STATE — All Take Out (single source of truth)

> Read this first in any new working session. Everything below is current as of **July 28, 2026**.

## July 28, 2026 — Stephen's change list (2 documents + fonts + BOPP)

Structural change: **one product page per category** (7 categories → 7 product pages). Shop is now a grid of 7 hero tiles (picture + name beneath); the product page is picture + description left, **"Choose a Template to Design"** grid right (mobile: picture → name → description → templates). Clicking a template opens the design tool directly on it. All the social sub-products (TikTok/FB/IG/X) merged into one **Social Media Labels** product carrying 11 templates. Slugs are now the category slugs — the bundle funnel references `branded-labels` / `qr-code-labels`.

- **Currency**: CAN/US toggle in the header (`ato_currency`, USD base, demo CAD rate 1.38 in `data.js CURRENCIES`) — `ATO.money()` / `ATO.moneyUnit()` convert everywhere.
- **Free ground shipping on every order** (not just VIP): `cartTotals()` returns shipping 0 / `shippingFree` always; cart + checkout show FREE; FAQ answer replaced with the US/Canada + Alaska/Hawaii/Yukon/Nunavut surcharge wording.
- **Design tool**: wizard order is now **Material → Shape → Size → Quantity** and the **template + shape steps drop out** when a template was chosen on the product page (Stephen's own suggestion — the template *is* the shape). Sizes derive from the template's proportions (square → 2/3/4", rectangle → 2x3/3x4/4x6). Materials cut to **Glossy Paper + BOPP (water resistant)**. Quantities **100/250/500/1000/1500/2000** showing roll price **and price per label**. Colour controls report **CMYK** (`hexToCmyk`). Fonts replaced with Stephen's Adobe list, **Montserrat Bold default** — `FONTS` is now `{label, stack, weight, style}` where `stack` is the closest Google match; swapping to his real Adobe kit = change the stacks only. Text box on canvas given a loud blue selection border. Bleed hint reworded to "Keep important content inside the dashed line" and restyled as a large dashed pill. `areabg` now overspills the measured zone ~1.2% to kill the hairline of placeholder art showing through. `restrict: 'text'` on address-zone templates hides image/clipart/QR/background tools (Stephen's optional ask — implemented).
- **Instant Proof** moved off checkout to its own page **`proof.html`** (cart → View instant proof → Approve → checkout), proof rendered up to 720px wide with full spec list.
- **Bundle page**: header on top, product picture left, the whole Save-20% value stack right (mobile: header → picture → value); 4 photos split across sections instead of one gallery block, side-by-side bags captioned **"From Ordinary to Branded & Scannable"**; VIP block rewritten to Stephen's wording + **Become a VIP Member** button; extra Build-Your-Bundle button under the design-tool section.
- **Faded text bug (root cause)**: `.lede`'s soft navy was being used inside `.section--ink`'s dark navy band. Fixed globally — `.section--ink p/.lede/li` now inherit the light band colour. That fixed both the bundle VIP block and VIP page's "Built for restaurants that move fast".
- **VIP page**: 4 animated shapes now — 50 FREE LABELS, FREE GROUND SHIPPING, RECALL PREVIOUS ORDERS, EXCLUSIVE PROMOTIONS. Email-verification note added under "How to join".
- **Home**: CAN/US toggle; 3 blue-check promises under the hero (Free Ground Shipping · Easy-to-Use Design Tool · Real Time Proofs); "into" lowercased in the marketing-opportunity heading; Start Designing button given breathing room; VIP kicker turned into a solid blue pill; "Roll & Bundle Order" wording.
- **Blog**: both placeholder posts deleted (no brand voice/SEO per Stephen), empty-state + sitemap cleaned.
- **Branding statement** "Turn Packaging into Repeat Business" (from `Branding Statement.ai`) styled in brand blue as a band on home, shop, product, about, making-labels, one-question.
- Images added to One Question and Making Labels; "Customization Made Easy" now sits at the bottom of every product page.
- WP plugin synced → **1.5.0**; theme 1.1.0.

**Still open from Stephen's list** (he said he'd follow up): Customer Appreciation tool rework ("ideas mentioned later"), the extra QR template he wants to add, and which current photos he plans to swap.

## July 23, 2026 session (Stephen's bug list + content drop)

- **Blue rebrand (Stephen's requirement)**: whole palette switched from green/orange to blue matching the logo. Logo blue sampled = `#5688C5`; tokens now `--blue-900 #14304C · --blue-700 #2E639E · --blue-600 #3F76B4 · --accent #2E6DB4 · paper #F8FAFC`. Header uses the **real logo** (`assets/img/logo.png`, transparent PNG made from `legacy/frontend-user-nextjs/public/images/logos/logo.jpg` — the old site's exact logo). Same mapping applied to WP theme (1.1.0) + plugin (1.4.0); dist zips rebuilt.
- **Nav**: About Us added (all pages via store.js NAV); items forced one-line (`white-space: nowrap`, tighter gaps); mobile-drawer breakpoint 900→1080px.
- **about.html**: new page, Stephen's About Us copy **verbatim** (chat message July 23). In footer Company column + sitemap.
- **Content drop integrated** (`client-assets/content-2026-07/` = full July drive folder, ~86 MB, preserved in repo): homepage rewritten to *New Home Page REVISED*; per-category copy + photo on shop.html and product.html (data.js `CATEGORIES[].long/bullets/photo`); vip.html = *VIP Circle REVISED* (5 named perks); making-labels.html = *Making Labels REVISED* (file types, designer review, RGB→CMYK, water-resistant, food-safe, rolls); faqs.html = full 25-question *FAQ REVISED* + BOPP; bundle.html hero = "Save 20% + FREE 50 Label VIP Reward" + photo gallery; poll → **q2** "greatest challenge" (5 options, old q1 auto-archives). Client photos compressed to `ato-custom/assets/img/` (~3.6 MB total, max 1100px wide).
- **Editor: Background colour option** (Stephen's request — every customizable product): side panel "Background colour" with 12 preset swatches + custom picker, injected by shared editor.js (`ensureBgPanel`), so product page, admin and the WP plugin all get it; toolbar tool renamed Colour→**Background**. Template mode recolours the printable area (`areabg`), classic mode recolours the canvas. Synced verbatim to plugin.
- **Note**: `Stack for Website.docx` in the content drop = Stephen's approved WP plugin stack for launch (Wordfence, UpdraftPlus, GTM+GA4, CookieYes, Clarity, Rank Math…) — implementation notes for the Hostinger deploy, not site copy.

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
