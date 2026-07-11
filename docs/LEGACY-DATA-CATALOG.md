# Legacy Database — Data Inventory (exported July 11, 2026)

Full JSON export lives on Hasan's machine: `Desktop\ATO-database-backup\` (+ zip). **Not committed here** — the export contains test-user emails and order records. This file records only the business-relevant structure.

## What the database held

| Collection | Count | Verdict |
|---|---|---|
| categories | 7 | ✅ Real, client-approved structure (below) |
| products | 12 | Skeletal — names only, no prices/sizes/shapes ("Gloss"/"Vinyl" materials at most) |
| users | 23 + 1 admin | Test accounts |
| orders | 3 | Test orders (embedded design images) |
| carts / images | 0 | Empty |

**Conclusion:** no production data existed. Nothing precious was at risk, and there is nothing worth importing except the category tree.

## The approved category tree (use this when configuring WooCommerce)

- **Social Media Labels** → Tik Tok, Facebook, Instagram, X (Twitter)
- **QR Code Labels**
- **Promotional Labels**
- **Branded Labels**
- **Tamper Evident Labels**
- **Customer Appreciation Stickers**
- **Food Identification Labels**

Note: the client flow document requires dynamic **sub-categories** (§2.2A). WooCommerce product categories are hierarchical natively — create the four social-media children as child categories of Social Media Labels at deployment. The theme's category grid pulls from `product_cat` automatically.

## Product setup still needed from Stephen

The legacy products had no real configuration. For each product we need: price (and quantity-tier prices), materials, sizes, shapes, template artwork. See the product-setup format in [DEPLOYMENT-HOSTINGER.md](DEPLOYMENT-HOSTINGER.md) §4.
