# Developer Handoff Checklist — call with Joseph (Exceed North)

> **Status July 11, 2026** — received `all-take-out-software.rar` (full source of all three apps: backend microservices, user frontend, admin frontend — archived in `legacy/`, audited in [LEGACY-AUDIT.md](LEGACY-AUDIT.md)). **Still outstanding:** ~~source code~~ → ✅; MongoDB data export (URI is in the RAR's `.env` files — export with Compass before the cluster disappears); Stripe (only a hardcoded *test* key existed — nothing real to hand over, Stephen connects his own account); real brand assets (the archive contains only placeholder logos/stock photos — ask **Stephen**, the developer never had them); domain ownership; Hostinger/WP admin access for the aqua-viper content site.

What to ask for on the call, in priority order. Get everything in writing (email/Drive links), not promises. The goal: **nothing about the old build should be only in his head or only on his machines.**

## 1. Access & ownership (the non-negotiables)

- [ ] **Hostinger account access** — whose account hosts `aqua-viper-332471.hostingersite.com`? If it's his, we need the site moved to Stephen's (or your) Hostinger account, or at minimum: hPanel access, a full site backup (Files + Database export from hPanel), and the WordPress admin login.
- [ ] **WordPress admin login** for the current Hostinger site (username + password, and make our account an Administrator).
- [ ] **Domain** — who registered the real domain (if any)? Registrar login or a transfer authorization. If launch is on Stephen's domain, we need DNS control.
- [ ] **Stripe account** — the Stripe account used by the Vercel app: is it Stephen's or the developer's? It must be Stephen's. Get the account email; **never accept API keys over chat** — Stephen should log in and issue new restricted keys himself (Live publishable + secret) when we connect the WooCommerce Stripe Gateway.
- [ ] **Vercel project + GitHub/GitLab repos** — source code for the Vercel app (`all-take-out-website`), both frontend and its backend/API + the **database** it uses (connection details or an export). Even though we're replacing it, we want the data and any logic worth keeping.
- [ ] **Email/notification services** — any transactional email service (SendGrid, Resend, etc.) or webhook configs tied to orders.

## 2. Design & content assets

- [ ] **All Take Out logo** — vector (AI/SVG/EPS) + PNG. Also any brand colours/fonts the client already approved.
- [ ] **Product photography & template artwork** — the label template files (source PSD/AI/Figma, not just exports), product images, clipart packs he licensed or created.
- [ ] **Figma/XD design files** for anything the client already approved visually.
- [ ] **Copy** — any approved product descriptions, FAQ answers, About text. (Per the scope doc, content is client-provided — check what Stephen already wrote.)
- [ ] **Adobe Fonts** — the scope promises Adobe Fonts in the editor. That needs **Stephen's own Adobe account** and a Web Project kit ID. Ask if one exists; if it's under the developer's account it has to be recreated under Stephen's.

## 3. Data from the working backend (the "sticker nonsense")

- [ ] **Database export** of the Vercel app (orders, users, saved designs, products/categories) — SQL dump or CSV per table.
- [ ] **Saved customer designs** — however they're stored (JSON blobs, S3/storage bucket, base64 in DB), get a full export plus a sample so we can write an importer if needed.
- [ ] **Order history** — if any real orders exist, we need them for the client's records even if we don't import them.
- [ ] **Product catalogue** — the exact list of products with materials, sizes, shapes, quantity tiers and prices currently configured. This becomes our WooCommerce product setup.

## 4. Knowledge transfer (15 minutes of questions)

- [ ] Which parts of the old build does **Stephen already like**? (Don't lose approved work.)
- [ ] Any **known bugs or unfinished features** in the Vercel app?
- [ ] What's the **printing workflow** on Stephen's side — file format the printer needs (PDF/X? PNG at 300dpi? bleed specs?), so our production email/export matches reality.
- [ ] Shipping — which carrier/rates was the client planning? (Our VIP free-ground-shipping hook currently zeroes flat-rate methods.)
- [ ] Was any **SEO** work done (domains, redirects, Search Console)?

## 5. From Stephen (the client) — separate from the developer

- [ ] Final **logo files** and brand approval on the new design direction (show him `preview/index.html`).
- [ ] **Stripe account login** (his own) — he connects it himself when we set up the payment gateway.
- [ ] **Product list sign-off**: names, materials, sizes, shapes, quantity tiers, prices for all 7 categories.
- [ ] **Copy**: FAQs, About/Making Labels text, shipping & returns policy, privacy policy.
- [ ] **Admin email** where production spec emails should go.
- [ ] Confirmation of the **VIP perks** exactly as built: 50 stickers on signup, free ground shipping. (If he wants the 50 stickers as an automatic cart item instead of a credit note, say so now — it changes the build.)
- [ ] His **Hostinger login** (or agree we host it on a plan he owns).

## Red flags to watch for on the call

- "The Stripe account is mine, I'll just keep it connected" → No. Money must flow to Stephen's account.
- "I'll send the files later" → Get at least the WP admin login and a Hostinger backup **during the call**.
- "The database is on my personal cluster" → Get an export immediately; those tend to disappear.
- Licensing: if template artwork/cliparts were bought under the developer's marketplace account, the license may not transfer — ask for license receipts.
