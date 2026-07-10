# Deployment Guide — Hostinger (no terminal required)

Everything happens in the browser: Hostinger hPanel + WordPress admin.

## 0. Prerequisites

- A Hostinger plan with a WordPress site installed (the existing `aqua-viper-332471.hostingersite.com` works — **take a backup first**: hPanel → Websites → Manage → Backups → Generate/Download both Files and Database).
- WordPress admin login (Administrator).

## 1. Core plugins

In **wp-admin → Plugins → Add New**, install and activate:

1. **WooCommerce** — run its setup wizard (store address, currency CAD/USD per Stephen, tax choices).
2. **WooCommerce Stripe Gateway** (by WooCommerce/Stripe).

## 2. Theme + customizer plugin

1. **Appearance → Themes → Add New → Upload Theme** → upload `dist/alltakeout-theme.zip` → Activate.
2. **Plugins → Add New → Upload Plugin** → upload `dist/ato-customizer.zip` → Activate.
3. **Settings → Permalinks → Save Changes** (once — registers the VIP Benefits account tab).

## 3. Pages & menus

1. Create pages (Pages → Add New):
   - **VIP Members** — set *Template: VIP Members* (right sidebar → Template).
   - **Making Labels** — *Template: Making Labels*.
   - **FAQs** — *Template: FAQs*. Tip: any H2/H3 headings you type in the page content become accordion questions; leave empty for the built-in starter set.
   - **Blog** — empty page.
2. **Settings → Reading**: "Your homepage displays" → *A static page*. Homepage = leave unset or any page (the theme's `front-page.php` renders the homepage automatically); Posts page = **Blog**.
3. **Appearance → Menus**: create *Primary* menu → Shop, VIP Members, Making Labels, FAQs, Blog → assign to *Primary Menu* location. (Optional: a *Footer* and *Legal* menu.)
4. **Appearance → Customize → Site Identity** → upload the logo once we have it (until then the theme renders a branded wordmark).

## 4. Categories & products

1. **Products → Categories**: create the seven categories with these exact slugs so the theme's icons match:
   `social-media-labels`, `qr-code-labels`, `promotional-labels`, `branded-labels`, `tamper-evident-labels`, `customer-appreciation-stickers`, `food-identification-labels`.
2. For each product (Products → Add New):
   - Name, description, product image, category, and a base **Regular price** (used when a quantity tier has no price).
   - In **Product data → ATO Customizer**: tick *Enable customizer*, then fill the five lists (one option per line):
     - Templates: `Classic Round|https://yoursite.com/wp-content/uploads/…/template.png` (upload template art to Media Library first; image optional)
     - Materials: `Glossy paper` etc.
     - Sizes: `3" x 3"` etc.
     - Shapes: `circle|Round`, `square|Square`, `rectangle|Rectangle`
     - Quantity tiers: `100|19.00`, `250|39.00`, … (price optional per tier)

> **Important:** template images must be uploaded to this site's own Media Library (same domain), otherwise browsers block the design preview export.

## 5. Stripe

1. **WooCommerce → Settings → Payments → Stripe** → *Enable*.
2. Connect with **Stephen's** Stripe account (he logs in during setup, or pastes keys he generated himself).
3. Test mode first: place a test order with card `4242 4242 4242 4242`, confirm:
   - order appears in WooCommerce → Orders,
   - the production spec email arrives at the admin email,
   - the design ref + preview shows on the order line item.
4. Switch to live keys.

## 6. Shipping & VIP

1. **WooCommerce → Settings → Shipping**: create a zone with a **Flat rate** ground method (VIPs automatically get it free — the plugin renames it "… — Free for VIPs" at checkout) and any express options you want (those stay paid).
2. **WooCommerce → Settings → Accounts & Privacy**: enable *"Allow customers to create an account during checkout"* and *"Allow customers to place orders without an account"* — this is exactly the guest/VIP split from the client's flow document.

## 7. Launch checklist

- [ ] Backup taken before starting
- [ ] Test order (guest) — no sticker credit, design attached ✓
- [ ] Test order (create account at checkout) — VIP role, 50-sticker note on order, free ground shipping ✓
- [ ] Production email received with fonts/config/preview ✓
- [ ] Admin edited a design in *ATO Designs* — edit history logged ✓
- [ ] Mobile pass on homepage, product page, editor, checkout
- [ ] Real domain pointed (hPanel → Domains) + SSL active
