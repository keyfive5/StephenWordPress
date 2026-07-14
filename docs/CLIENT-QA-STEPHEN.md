# Answers to Stephen's Questions (July 2026)

Prepared responses for the client's due-diligence questions. Short version of everything: **the new build is 100% real WordPress**, so every concern about "custom site vs. WordPress" dissolves — there is no custom site outside WordPress anymore.

---

**1. Can I use Rank Math, Google Site Kit / Analytics / Search Console / Tag Manager, Microsoft Clarity, Cloudflare, Wordfence, CookieYes, and state-by-state US tax plugins?**

Yes — all of them, with no workarounds. The new site is a standard WordPress + WooCommerce installation; your storefront design is a WordPress theme and the sticker customizer is a WordPress plugin. Any plugin that runs on WordPress runs here. Specifically: Rank Math ✓, Site Kit (bundles Analytics, Search Console and Tag Manager in one plugin) ✓, Microsoft Clarity ✓ (official plugin), Wordfence ✓, CookieYes ✓, Cloudflare ✓ (works at the DNS level plus an optional plugin). For state-by-state US taxes: **WooCommerce Tax** (free) calculates correct rates per state/county/city automatically at checkout; if you later want filing automation, **Avalara AvaTax** or **TaxJar** plug straight into WooCommerce. New York vs. Florida is handled out of the box.

**2. Is the new setup independent of WordPress, or headless WordPress?**

Neither — and this is the key change from the previous developer's approach. The old build was exactly what your research warned you about: a custom application *outside* WordPress that couldn't use WordPress plugins. The new build puts **everything inside WordPress**: content, shop, checkout, and the label customizer itself. No headless setup, no workaround needed — the problem your research identified has been designed out.

**3. Can the One Question Page have a running percentage counter?**

Yes — it's already built. There's a `[ato_poll]` shortcode: you (or anyone) place it on a page with your question and answer options; visitors vote once, and results display as animated bars with percentages that count up live, plus a running vote total. Changing the question is a one-line edit on the page — no developer needed.

**4. Can the VIP Membership flow be tweaked in the future?**

Yes. It's our own plugin code (not a rigid third-party product): the 50-sticker amount is a single setting, and the perks (free ground shipping, credit behavior, who qualifies) are each small, isolated pieces that can be changed without touching the rest of the site.

**5. Can I run specials and promotions over and above VIP?**

Yes — that's native WooCommerce: coupon codes (percentage, fixed, free shipping, usage limits, expiry dates), scheduled sale prices per product, and storewide sales. VIP perks stack on top automatically. You can create all of these yourself from the dashboard.

**6. Will there be integration with future email/SMS promotions?**

Yes. WooCommerce has first-class integrations for Mailchimp, Klaviyo, Omnisend, Brevo (email) and Twilio/SMS plugins — they sync your customer list and order history automatically for campaigns and abandoned-cart flows. Transactional emails (order confirmations, production specs) are already built in.

**7. Can I change images, text, pricing, quantities, upload templates, and post blogs without your help?**

Yes to all of it — this was a design goal. Products, prices, quantity tiers, materials, sizes, shapes and template artwork are edited on the product page in the dashboard (plain text lists — no code). Site text and images are in the normal page editor. **Blogging is completely standard WordPress** — the strongest blogging platform there is, which is a big part of why we insisted on real WordPress for your business model. Write, schedule, categorize, publish — the theme styles it automatically.

**8. Who controls source code & database?**

You do. The code lives in a GitHub repository that can be transferred to an account you own; the site and its database run on hosting registered to you; the WordPress admin account is yours. We hold nothing hostage.

**9. What happens if we stop working together? Can another developer take over? Is the admin system documented?**

This is WordPress + WooCommerce — the most widely known web stack in existence (~40% of the web). Any WordPress developer or agency can take over with zero ramp-up on proprietary tech. The repository already includes written docs: deployment guide, requirements traceability, product-setup instructions, and an audit of the previous system. The site keeps running regardless of any developer relationship because it's on your hosting under your accounts.

**10. What are the ongoing costs? Are they fixed?**

Fixed and small: hosting (Hostinger, roughly $3–12/month depending on plan), domain (~$15/year). Stripe is not a subscription — it takes a per-transaction fee (~2.9% + 30¢) only when you get paid. Every plugin listed in question 1 has a free tier that covers a business of this size; paid upgrades (e.g., Rank Math Pro, AvaTax) are optional and can be added later. Our theme and customizer plugin carry **no license fees — you own them**.

**11. As the site grows — can categories be added/deleted? Canada/US pricing changed?**

Yes. Categories (and sub-categories, e.g., TikTok/Instagram/Facebook under Social Media) are managed in the dashboard — add, rename, delete anytime. Pricing structure is changeable: the store currency is a setting (currently CAD; switchable to USD), and if you want to sell in **both** currencies simultaneously, a currency-switcher plugin adds that. Option-based price adjustments (e.g., vinyl costs more than gloss) can also be added to the customizer — tell us which pricing model you prefer and we configure it.

**12. What will the website benefit and/or lack without WordPress?**

Flipped around, because we made the opposite choice: **without** WordPress you'd lose the plugin ecosystem (question 1), self-serve editing (question 7), first-class blogging, easy developer replacement (question 9), and you'd pay a developer for every content change. That's exactly why the new build is native WordPress. What custom code buys you — the sticker customizer — you still get, but as a WordPress plugin *inside* the ecosystem instead of a separate app outside it. You lose nothing.

**13. Upon complete payment — will I own the website 100%?**

Yes. The theme and plugin code (GPL-compatible, standard for WordPress), the content, the design files, the database, and the accounts (hosting, domain, Stripe, Google) are all yours. Recommendation we'll enforce as we set things up: every account gets registered under **your** email from day one, so ownership is never even a question.
