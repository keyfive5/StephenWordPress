# Client Requirements → Implementation Map

Source documents: **"Job Scope: All Take Out"** (Exceed North proposal for Stephen Wilding / Kew Stick Inc.) and **"ATO user flow"** (User & Admin Journey). Every requirement below is quoted or paraphrased from those documents, with where/how this build delivers it.

## 1. Platform architecture

| Requirement (scope §2.1) | Status | Implementation |
|---|---|---|
| WordPress-powered content website | ✅ | Custom theme `alltakeout`; all content editable in wp-admin |
| Pages: Home, Shop, VIP Members, Making Labels, FAQs, Blogs | ✅ | `front-page.php`, WooCommerce shop, page templates `template-vip.php`, `template-making-labels.php`, `template-faqs.php`, blog `index.php` |
| Shop categories: Social Media, QR Code, Promotional, Branded, Tamper-Evident, Customer Appreciation, Food Identification | ✅ | Rendered from WooCommerce `product_cat` terms (with a built-in fallback list so the site never looks empty) — `ato_get_categories()` in `functions.php` |
| Custom sticker customization module integrated into the storefront | ✅ | Plugin `ato-customizer` — one WordPress plugin instead of a separate Vercel app |

## 2. Customer customization workflow (scope §3)

| Requirement | Status | Implementation |
|---|---|---|
| Step 1: category → product info page | ✅ | Standard WooCommerce category → product flow, themed |
| Step 2: configure Template, Material, Size, Shape, Quantity | ✅ | Config wizard in the editor overlay; options set per-product in the *ATO Customizer* product tab |
| Selections stored and passed into the customization interface | ✅ | Selections drive canvas shape/size and are saved with the design + order |
| Background colour selection | ✅ | Colour tool in the editor |
| Text editing: fonts, movement, resizing, rotation | ✅ | Fabric.js IText — drag, scale, rotate; curated 10-font library |
| Adobe Fonts | ⏳ Pending client asset | Font list is one array (`ATO_Frontend::editor_fonts()`); plugs in the moment we get Stephen's Adobe Web Project kit ID (see handoff checklist) |
| Image upload & positioning | ✅ | Upload tool (2 MB guard), embedded in the design |
| Clipart selection | ✅ | 8 bundled food-themed SVGs; adding more = dropping files in `assets/clipart/` |
| QR code generation & placement | ✅ | QR tool — paste a link, QR is generated client-side and placed on the canvas |
| Layer ordering and positioning | ✅ | Layers panel + bring-forward/send-backward controls |
| Drag-and-drop, real-time preview, mobile responsive | ✅ | Fabric.js canvas; editor layout reflows at 960px/560px breakpoints |
| Step 4: preview & checkout; design assets and layer details retained | ✅ | Save → PNG preview + full layered JSON stored as an `ato_design` record with unique ref, linked through cart → order |

## 3. User roles & checkout (flow doc §1, §4)

| Requirement | Status | Implementation |
|---|---|---|
| Guest browses, customizes, orders via guest checkout — no free stickers | ✅ | WooCommerce guest checkout; designs save without login |
| Account created during checkout → VIP role + 50 complimentary stickers automatically | ✅ | `woocommerce_created_customer` hook: adds `ato_vip` role + credits 50 stickers (`ATO_VIP`) |
| Logged-in VIP: benefits applied automatically | ✅ | Free ground shipping filter + credit note added to the order for the production team |
| Payment via Stripe | ✅ (config step) | Official WooCommerce Stripe Gateway plugin; connect Stephen's account keys at deployment |
| Order logs: creation, payment, VIP sticker application, template attachment | ✅ | WooCommerce order notes + design edit history + design ref on each line item |

## 4. Admin (scope §4, §7; flow doc §2)

| Requirement | Status | Implementation |
|---|---|---|
| Admin manages categories, products, templates, orders | ✅ | Standard WooCommerce + *ATO Customizer* product tab |
| All user-customized templates stored in the database | ✅ | `ato_design` custom post type: layered JSON + config + fonts + preview PNG |
| Admin can view/edit customized designs | ✅ | *ATO Designs* menu → opens the same editor in admin mode |
| Edit tracking / change history visibility | ✅ | Every save appends to the design's edit log (who, when, note), shown on the design screen |
| Order notification email with: customer name, order number, template, material, dimensions, shape, font names, image & QR details, layered data | ✅ | Production spec email on payment (`ATO_Emails`) with preview image and a link to the design |
| Quality control before print | ✅ | Designs reviewable/editable from the order screen ("Review customer design" button on each line item) |

## 5. UI/UX objectives (scope §6)

| Requirement | Status | Implementation |
|---|---|---|
| Modern, visually appealing layout | ✅ | Custom design system: Fraunces + DM Sans, paper/green/tangerine palette, sticker-motif visuals — see `preview/index.html` |
| High-quality template thumbnails | ✅ | Template step shows image cards (images come from product setup) |
| Clear guidance and tooltips | ✅ | Step chips, cut-line hint, per-tool labels, empty states |
| Smooth, responsive interactions | ✅ | 150–300 ms transitions, reduced-motion support, scroll-reveal |
| Mobile and small-screen optimization | ✅ | Mobile-first theme; editor reflows for small screens |
| Accessible to users with no design experience | ✅ | Wizard defaults, auto-selection, one-click centering, human review messaging |

## Known deltas / decisions to confirm with Stephen

1. **50 complimentary stickers** are implemented as a *credit tracked on the account + a production note on the next order* (simplest reliable interpretation). If he expects a physical "free sheet of 50" product auto-added to the first order, that's a small change — confirm.
2. **VIP free ground shipping** currently zeroes `flat_rate` / `local_pickup` methods. Confirm carrier/rates once shipping is decided.
3. **Adobe Fonts** pending the client's Adobe account (scope promised it; Google Fonts curated set shipped meanwhile).
4. **Main categories as static pages** (flow doc §2.2A) — implemented as WooCommerce categories instead, which is better for shop filtering/SEO; the nav can still link them like static pages.
