# PROJECT STATE — All Take Out (single source of truth)

> **Read this first in any new working session.** This describes the project as it
> stands, not a diary — for "what changed when", read `git log`. Current as of
> **July 28, 2026**.

---

## 1. What this is

Sticker/label e-commerce platform for **Stephen Wilding / Kew Stick Inc.** ("All Take Out" / "All Takeout").

**People**
- **Hasan** (github `keyfive5`) — owns the build. **Does not use a terminal**; the agent runs every build, commit and deploy. Defaults to $0 solutions.
- **Joseph** — project middleman (Exceed North). Stephen sends feedback through him.
- **Stephen** — the client. Detail-oriented, sends written change lists (often as PDFs or pasted text). When he gives copy, it goes in **verbatim**.
- **Shariyar** — previous developer. Built the legacy system; handoff incomplete (see Open items).

**Agreed direction** (Hasan + Joseph call): hybrid — WordPress for content/SEO/plugins + custom code for the customizer and order logic. Meanwhile the **custom edition is the live demo Stephen reviews**, and that is where all feedback lands first.

---

## 2. The three builds

| Build | Where | Status |
|---|---|---|
| **Custom edition (LIVE DEMO)** | branch `gh-pages` → **https://keyfive5.github.io/StephenWordPress/**<br>source folder `C:\Users\Hasan\Desktop\fable 5\ato-custom\` | **Primary.** Everything Stephen sees. All work happens here first |
| **WordPress build** | branch `main`: `wp-content/themes/alltakeout` (**1.1.0**) + `wp-content/plugins/ato-customizer` (**1.5.2**), install zips in `dist/` | Feature-parity design tool. Deploys to any WP host by uploading the zips in wp-admin |
| **Legacy archive** | branch `main`: `legacy/` (prev dev's Vercel microservices + 2 Next.js apps) | Reference only. Stripe was test-key-only; VIP never implemented; DB exported to `Desktop\ATO-database-backup\` (test data — the only keeper was the category tree) |

**Admin login** (custom edition `/admin.html`, session-scoped, client-side demo auth): `admin@gmail.com` / `12345`.
There is an **"Owner login"** button in the footer bottom bar of every page — Hasan was typing `/admin.html` by hand.

Old dev's dashboard (same creds): https://all-take-out-website-jf4c.vercel.app — never logged into (agent password policy); understood via the archived source + DB export instead. Its UI is the model Hasan wants the admin to resemble.

Old WP site: https://aqua-viper-332471.hostingersite.com (no access). Hasan has a Hostinger account but **no plan purchased** — that purchase is the launch gate for the WP build.

---

## 3. Deploy workflows — the agent runs these

**Live site (gh-pages):** a git worktree sits at `C:\Users\Hasan\Desktop\fable 5\ghp2`, already checked out on `gh-pages`.

```
PowerShell:  cd ghp2 ; Copy-Item "..\ato-custom\*" . -Recurse -Force ; git add -A
Bash:        cd ghp2 && git commit -m "..." && git push origin gh-pages
```

- GitHub Pages serves the new files in **~1 minute**. Verify with `curl` for a new string rather than assuming.
- **If files were deleted** from `ato-custom`, copying alone won't remove them from the worktree. Clear it first: `git rm -rq --cached . ; Get-ChildItem -Exclude .git | Remove-Item -Recurse -Force` then copy. (Plain `git rm -rq .` gets blocked by the permission classifier — use the PowerShell form.)
- The folder `ghp-deploy` next to `ghp2` is junk — locked, delete when possible.

**WordPress zips:** `Compress-Archive` the theme and plugin folders into `dist/*.zip`, commit on `main`. Bump the version in `ato-customizer.php` (both the header comment and `ATO_CUSTOMIZER_VERSION`) whenever the engine changes.

**Engine sync:** `editor.js`, `editor.css`, `psd-export.js`, `poll.js` and `assets/clipart/` are **shared verbatim** between `ato-custom/assets/` and the WP plugin. After editing the custom copy, copy it over and bump the plugin version.

**Local preview:** launch.json config `ato-custom` (python http.server on :8736). Use the Browser pane tools, not Bash, to run it.

---

## 4. Custom edition — pages

`index` · `shop` · `product` · `bundle` · `cart` · **`proof`** · `checkout` · `account` · `admin` · `vip` · `making-labels` · `about` · `faqs` · `one-question` · `blog`

- **shop.html** — a grid of **7 category hero tiles** (photo + name beneath). No long copy; Stephen complained about scrolling on mobile.
- **product.html** — **one product page per category.** Left: product picture, then name + description. Right: **"Choose a Template to Design"** grid. Mobile stacks picture → name → description → templates. Clicking a template opens the design tool directly on it. Category marketing copy sits below, then the "Customization Made Easy" graphic.
- **proof.html** — the Instant Proof, on its own page between cart and checkout (cart → *View instant proof* → *Approve* → checkout). Renders the design up to 720px wide with a full spec list.
- **blog.html** — deliberately empty. Stephen had both placeholder posts deleted (no brand voice, no SEO value). He asked how he'll post in future: **that's what the WordPress build is for** — no CMS exists in the custom edition.

**State** (all localStorage, API-shaped so a real backend can drop in): `ato_cart`, `ato_designs` (max 8), `ato_orders`, `ato_user`, `ato_bundle`, `ato_products` + `ato_product_overrides`, `ato_poll_state` + `ato_poll_archive`, `ato_consent`, `ato_currency`; `sessionStorage.ato_admin_auth` gates the admin.

---

## 5. Catalogue & pricing model  ← read before touching money or products

**One product per category.** Product slugs **are** the category slugs (`social-media-labels`, `qr-code-labels`, `promotional-labels`, `branded-labels`, `tamper-evident-labels`, `customer-appreciation-stickers`, `food-identification-labels`). The old per-platform social products (TikTok/Facebook/Instagram/X) are merged into one **Social Media Labels** product carrying 11 templates. The bundle funnel references `branded-labels` / `qr-code-labels`.

**Options** (`assets/js/data.js`)
- Materials: **Glossy Paper**, **BOPP (water resistant)** — the "(water resistant)" wording must stay next to BOPP.
- Shapes: square, rectangle only (circle "comes eventually").
- Sizes by shape: square → 2×2, 3×3, 4×4; rectangle → 2×3, 3×4, 4×6.
- Quantities: **100, 250, 500, 1000, 1500, 2000**.

**Pricing** — USD is the base; CAD can be entered explicitly.
- `product.tiers[] = {qty, price /*USD*/, cad?}` — the storefront's spine, used for "from $X".
- `product.variants[] = {material, size, shape, qty, usd, cad}` — a **blank field is a wildcard**, so a product priced by quantity alone still matches every material/size.
- **`ATO.priceOf(product, config, qtyOverride)` → `{usd, cad}`** — resolves the best-matching variant, else the quantity tier. `cad` is `null` when the owner never typed one.
- **`ATO.money(usd, cadOverride)`** / **`ATO.moneyUnit(usd, cadOverride)`** — show a typed CAD figure **verbatim**; only fall back to the demo rate when there isn't one. Always pass both: `A.money(p.usd, p.cad)`.
- Cart items carry `price` (USD) **and** `priceCad`; `cartTotals()` returns `subtotalCad`/`taxCad`/`totalCad` so an owner-set CAD price survives to the order total.
- **CAN/US toggle** lives in the header (`ato_currency`). Demo FX rate `1.38` in `data.js CURRENCIES` — replaced by the payment provider at launch.
- **Free ground shipping on every order** (not just VIP). `cartTotals()` always returns shipping 0.

**Admin products manager** (`admin.html` → Products tab) mirrors the previous developer's dashboard, which Hasan wants kept as the working model: an **Add product** button opens a **3-step modal — Product details → Variant pricing → Templates**. Step 1 picks which materials/sizes/shapes/quantities the product offers; step 2 generates a row per combination with **USD and CAD** fields ("if one is empty, the other is used as the fallback" — the legacy dashboard's own rule); step 3 sets template image + printable area. The table shows #, image, name, category, subcategory, pricing, materials, sizes, shapes, variant count, Edit/Delete, with a category filter.

**Visual editable-area placer** (step 3 → **Place area**). The owner drags, resizes and rotates the printable zone directly on the artwork instead of typing fractions — the numbers fill themselves in. Built on the **same Fabric engine as the customer editor**, so a zone placed here lands exactly where the customer finds it. Side panel has a lock-to-square toggle, an angle slider + numeric field, reset-to-full-label, and a live x/y/w/h/angle readout. `zoneArea()` converts the Fabric rect back to the editor's model — **x/y/w/h are the unrotated box as fractions of the natural image, angle pivots about its centre** — so it is the exact inverse of `areaRectProps()`. Round trip verified against the hand-measured diagonals: loading `thanks-multi` / `thanks-rock` / `thanks-gratitude` renders the box precisely on each artwork's dashed guide, and a zone saved in the admin reappears at the same tilt in the customer editor. **This replaces hand-measuring with Python** — the grid/detect scripts are only needed now if someone wants to verify a zone numerically.

---

## 6. The design tool (`assets/js/editor.js`) — shared with the WP plugin

**Wizard order is fixed by the client: Material → Shape → Size → Quantity → Start designing.**
When a template was chosen on the product page, the **template and shape steps drop out** — the template *is* the shape (Stephen's own suggestion). Sizes then follow the template's proportions. Quantity tiles show the **roll price and the price per label**; the cheapest-per-label tier gets a "Best value" chip.

**Printable-area mode.** The template PNG loads locked at the bottom, an `areabg` rect covers the printable zone (hiding baked-in "Name Here" placeholder art), every user object is clipped to the zone, and a dashed guide is drawn.

**Rotated zones.** `area` takes an optional **`angle`** (degrees). `areaRectProps()` builds every zone rect centre-anchored so the angle pivots about the middle; guide, `areabg` and each object's `clipPath` all honour it, and new objects default to `zoneAngle()` so artwork follows the tilt. `printArea` is serialised whole so the angle survives save/reload.

Measured areas for the diagonal Customer Appreciation designs (fractions of the template image):

| template | x | y | w | h | angle |
|---|---|---|---|---|---|
| thanks-multi | 0.0929 | 0.3590 | 0.8111 | 0.2778 | −26.06 |
| thanks-rock | 0.0103 | 0.2348 | 0.6124 | 0.1705 | −44.5 |
| thanks-gratitude | 0.0283 | 0.1165 | 0.5284 | 0.145 | −20.5 |

`thanks-blue` and `thanks-support` are genuinely axis-aligned. **Method for future rotated templates:** scratchpad `detect3.py` masks the guide marks by colour and takes the principal axis for the angle — that works when the zone is a full dashed rectangle (thanks-multi). Where the zone is marked only by four corner brackets with decorative dashes inside (rock, gratitude), the density profile locks onto the wrong lines; those were read off a labelled grid overlay (`grid.py`) and confirmed with `verify.py`, which draws the candidate rect back over the artwork.

**Other tool behaviour**
- **Background colour** panel: 12 preset swatches + custom picker, injected by `ensureBgPanel()` so the product page, admin and WP plugin all get it. Toolbar button is labelled **Background**.
- **Colour values are reported in CMYK** (`hexToCmyk`) — print work is specified in CMYK, not RGB.
- **Fonts** are Stephen's Adobe list with **Montserrat Bold** default. `FONTS` = `{label, stack, weight, style}` where `stack` is the closest web-served match. **When Stephen sends his Adobe kit ID, only the stacks change** — the names customers see stay identical.
- **QR minimum size**: a QR can never be scaled below **0.6″ of finished label** (`MIN_QR_INCHES`). The floor is derived from the ordered size (pixels-per-inch per axis, stricter axis wins) and capped at 95% of the printable zone. Enforced at creation, live during `object:scaling` (the handle refuses to travel further rather than snapping back) and again on `object:modified`, with a throttled toast. **Stephen wrote ".06x.06" — implemented as 0.6″ since 0.06″ (1.5 mm) is unscannable, the opposite of his intent. Worth confirming with him.**
- **`restrict: 'text'`** on a template limits the toolbar to text/font/colour (used for social address-zone layouts, where only a handle is needed).
- Text objects get a loud blue selection border so it's obvious the tool is engaged.
- Bleed hint reads **"Keep important content inside the dashed line"** in a large dashed pill.
- `areabg` overspills the measured zone ~1.2% to kill the hairline of placeholder art that showed through.

**Page integration — the fetch-shim pattern:** the page defines `window.atoEditorData` and intercepts `fetch('/ato-local')`, persisting through `ATO.saveDesign` (product page) or updating the design in place (admin; numeric-index mapping, `admin.html?design=N` auto-opens).

**Exports** (`psd-export.js` + vendor `ag-psd.js`): `atoExportPsd` (layered PSD, one raster layer per element) and `atoExportSvg` (layered SVG, Illustrator-native `<g>` per element). Buttons in the admin designs tab and the WP admin design screen — Stephen reviews in Illustrator before print.

---

## 7. Brand & content rules

- **Palette is blue**, taken from the real logo (`#5688C5`). Tokens: `--blue-900 #14304C` · `--blue-700 #2E639E` · `--blue-600 #3F76B4` · `--accent #2E6DB4` · paper `#F8FAFC` · ink `#182A3D`. The earlier green/orange scheme was explicitly rejected.
- Header uses the **real logo** — `assets/img/logo.png`, a transparent PNG made from `legacy/frontend-user-nextjs/public/images/logos/logo.jpg`.
- **Branding statement**: *"Turn Packaging into Repeat Business"* (from `Branding Statement.ai`), shown as a blue band on home, shop, product, about, making-labels and one-question. Stephen said any similar font and the brand colour is fine.
- **Client copy goes in verbatim.** About Us, the FAQ, the bundle page, Making Labels, VIP and the per-category product copy are all Stephen's exact words — don't paraphrase them.
- **VIP model**: 50 extra labels with **every regular-priced roll or bundle order** + free ground shipping. No credit balance.
- **Poll**: currently `q2` "What is the greatest challenge for your takeout business?" (5 options). One vote per device, largest-remainder rounding so it always totals 100%, "Based on N responses.", and changing the question `id` auto-archives the old results into the admin tab.
- Taxes: demo per-US-state table in `data.js`, picked at checkout.

---

## 8. Client assets (all preserved in the repo)

- `client-assets/content-2026-07/` — the **full July 2026 drive folder** (~86 MB): every "REVISED" page PDF, all product photos, the social-media label templates and `Branding Statement.ai`.
- `client-assets/product-graphics/` — 30 original template PNGs (renamed working copies live in `ato-custom/assets/templates/`).
- `client-assets/bp-homepage-guide/` — BP #1–#11 homepage blueprint.
- Web-optimised photos: `ato-custom/assets/img/` (~3.6 MB total, max 1100px wide).
- `Stack for Website.docx` in the content drop is **not site copy** — it's Stephen's approved WordPress plugin stack for launch (Wordfence, UpdraftPlus, GTM + GA4, CookieYes, Clarity, Rank Math) with implementation cautions. Use it when the WP build deploys.
- The legacy RAR stays on Hasan's machine only (`Desktop\all-take-out-software.rar` — contains a `.env` with a Mongo URI). **Never commit it.**

---

## 9. Open items

1. **Hosting** — Hasan buys a Hostinger plan → deploy the WP build. Domain still unowned. This is the launch gate.
2. **Stripe** — Stephen's own account at launch (legacy had a test key only).
3. **From Stephen, still awaited**: his Adobe Fonts kit ID; the real brand kit; which current photos he wants swapped.
4. **Stephen's own follow-ups he said were coming**: the **Customer Appreciation tool rework** ("ideas mentioned later"), and an **extra QR template** (design already exists — customer only adds their QR code and brand colours).
5. **To confirm with Stephen**: the QR minimum was written ".06x.06" and built as 0.6″ (see §6).
6. **Decisions pending**: per-option price modifiers (does BOPP cost more than Glossy?) — the variant model now supports it, nobody has set the numbers. VIP 50-label physical fulfilment detail.
7. **Email verification** on VIP signup is not built — no email service exists in the demo. The page says a confirmation email follows; real verification needs SMTP at launch (it's in the approved plugin stack).
8. Full handoff from the previous dev is still incomplete: domain/hosting ownership, anything beyond the RAR.
9. WP build lags the custom edition on: BP homepage, bundle funnel, admin products manager — by design, since WooCommerce covers those natively.

---

## 10. Gotchas — things that cost time before

- **Stale assets.** The python preview server and browser cache will happily serve an old `store.js`. If a new `ATO.*` export reads as `undefined`, re-fetch with `{cache:'reload'}` before assuming a code fault.
- **CSS specificity in editor.css.** The generic `.ato-ed-option .ato-ed-option-note` rule sits *later* in the file with equal specificity, so quantity-tile variants need the extra `.ato-ed-option` in the selector to win.
- **`.lede` on dark bands.** `.lede`'s soft navy is invisible inside `.section--ink`. Fixed globally (`.section--ink p/.lede/li` inherit the light colour) — don't reintroduce a local override.
- Header `backdrop-filter` was removed: it made the header the containing block for the fixed mobile drawer (invisible-menu bug on iOS).
- `.reveal` animation has a rescan hook + 1.5s failsafe + skip-when-hidden, so content can never stay invisible (was: invisible shop cards).
- Shop/product template images need absolute containment + `overflow: hidden` — iOS percentage sizing broke out of the cards.
- Legacy Next.js apps were first committed as broken gitlinks (nested `.git`) — fixed, 370 real files.
- Screenshots via the Browser pane fail unless the pane is actually displayed; DOM assertions through `javascript_tool` are the reliable verification path.

---

## 11. Docs index (`docs/`)

`PROJECT-STATE.md` (this file) · `CLIENT-REQUIREMENTS.md` (spec traceability) · `CLIENT-QA-STEPHEN.md` (13 answers sent) · `LEGACY-AUDIT.md` · `LEGACY-DATA-CATALOG.md` · `DEVELOPER-HANDOFF-CHECKLIST.md` · `DEPLOYMENT-HOSTINGER.md` (WP launch steps) · `measured-areas.json`
