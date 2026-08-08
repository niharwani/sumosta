-- ============================================================
-- SUMOSTA D1 SYNC — reconcile with site (STATIC_PRODUCTS)
-- Source of truth: apps/web/src/lib/content.ts + gifting-combos.tsx
-- Prices verified against: Honey Pricing & discounts for Website.pdf
-- Run: npx wrangler d1 execute sumosta-db --remote --file=src/db/003_sync_site_products.sql
--
-- Model change:
--   OLD D1: one product per size (prod_owf_500 + prod_owf_250 = 2 rows)
--   NEW D1: one product per honey with variants (prod_wf_honey_500 has var_wf_250g + var_wf_500g)
--   This matches how the storefront cart + checkout are wired.
--
-- Combos on /gifting are NOT stored in D1 — they're frontend aggregations
-- that add the underlying products+variants to the cart and apply COMBO10.
-- ============================================================

-- 1) Clear derived tables (safe — no orders reference variants yet)
DELETE FROM product_images;
DELETE FROM product_variants;

-- 2) Drop every product that isn't in the site's 6-product set.
--    order_items.product_id has ON DELETE RESTRICT — but the one referenced
--    product (prod_wf_honey_500) is in the new set, so the delete succeeds.
DELETE FROM products WHERE id NOT IN (
  'prod_wf_honey_500',
  'prod_stingless_250',
  'prod_tribal_500',
  'prod_honeydew_500',
  'prod_raktbeej_500',
  'prod_trial_box_60g'
);

-- 3) Upsert the 2 categories the site actually uses; drop the rest.
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  ('cat_raw_honey',  'Raw Forest Honey',    'raw-honey',  'NABL lab tested, NPOP APEDA Organic certified, 100% raw forest honeys sourced from pristine Indian reserves', 1),
  ('cat_gift_boxes', 'Gift Boxes & Combos', 'gift-boxes', 'Curated collections and premium gift boxes of our finest wild forest honeys.', 2)
ON CONFLICT(id) DO UPDATE SET
  name        = excluded.name,
  slug        = excluded.slug,
  description = excluded.description,
  sort_order  = excluded.sort_order;

DELETE FROM categories WHERE id NOT IN ('cat_raw_honey', 'cat_gift_boxes');

-- 4) Upsert the 6 real products. Uses ON CONFLICT DO UPDATE so we don't
--    trigger the order_items FK RESTRICT (unlike INSERT OR REPLACE).
INSERT INTO products (
  id, name, slug, sku, category_id,
  short_description, description,
  price, compare_at_price, cost_price,
  stock, low_stock_threshold, weight,
  tags, is_featured, is_active,
  meta_title, meta_description
) VALUES
(
  'prod_wf_honey_500',
  'Organic Wild Forest Honey',
  'organic-certified-wild-forest-honey',
  'SM-WF-500',
  'cat_raw_honey',
  'NPOP APEDA Certified, NABL Lab tested, 100% raw, Un-processed Honey',
  'This NPOP-APEDA Organic Certified raw forest honey is unprocessed, unheated, and minimally filtered to preserve its natural pollen, active enzymes, antioxidants, amino acids, and essential nutrients. Apis dorsata bees collect nectar from flowering trees such as Sal, Haldu, Ashid, Jamun, and Khair, along with hundreds of species of wildflowers, medicinal herbs, shrubs, vines, and other native forest plants.',
  599, 699, 220, 120, 10, 500,
  '["raw","organic","wild-forest","apeda","npop"]',
  1, 1,
  'Organic Wild Forest Honey | SUMOSTA',
  'Buy 100% pure NPOP APEDA certified organic wild forest honey. Sourced sustainably, rich in medicinal benefits.'
),
(
  'prod_stingless_250',
  'Rare Dammer Bee Honey',
  'rare-dammer-bee-honey',
  'SM-STB-250',
  'cat_raw_honey',
  'Ultra-rare, high-end therapeutic stingless bee honey. Tangy, dark amber, harvested from the hills of Nagaland.',
  'Known locally as Melipona honey, this is the holy grail of medicinal honeys. Stingless bees (Dammer bees) are tiny, feeding on smaller medicinal flowers that larger bees cannot reach. The honey has a distinct, sour-tangy flavor due to natural fermentation inside the bee propolis cells. It has 10x the antioxidant density of standard honey and is highly priced for eye, skin, and respiratory healing.',
  1399, 1699, 600, 25, 5, 250,
  '["rare","stingless-bee","nagaland","medicinal","tangy"]',
  1, 1,
  'Rare Dammer Bee Honey from Nagaland | SUMOSTA',
  'Discover the medicinal power of rare Dammer Bee Honey sourced from Nagaland. Highly antimicrobial, rich and tangy.'
),
(
  'prod_tribal_500',
  'Artisanal Heritage Forest Honey',
  'artisanal-heritage-forest-honey',
  'SM-TF-500',
  'cat_raw_honey',
  'Wild multi-floral honey sourced from the protected Kandhamal reserve. Sweet, earthy, and 100% natural.',
  'Sourced from the deep biosphere of Kandhamal in Odisha, this artisanal heritage honey is collected from the wild hives of Apis dorsata (giant rock bees). The bees feed on native sal, mahua, and neem trees, imparting a thick, deep-golden body and an earthy, dark-caramel taste. Completely raw, unfiltered, and packed with bioactive compounds.',
  699, 799, 240, 80, 10, 500,
  '["raw","artisanal","kandhamal","multi-floral","earthy"]',
  1, 1,
  'Artisanal Heritage Forest Honey (Kandhamal Odisha) | SUMOSTA',
  'Authentic wild artisanal heritage forest honey from Kandhamal, Odisha. Hand-harvested, raw and pure.'
),
(
  'prod_honeydew_500',
  'Canopy Dew Forest Honey',
  'canopy-dew-forest-honey',
  'SM-HD-500',
  'cat_raw_honey',
  'Rare, dark, mineral-rich dew honey from the massive Sal forests of Saranda. Deep woody flavor.',
  'Unlike standard honey, Canopy dew forest honey is made by bees collecting sap secretions rather than flower nectar. Sourced from the dense Sal reserve of Saranda, Jharkhand, this honey is extremely dark, almost black. It is less acidic, crystallization-resistant, and possesses a robust woody flavor rich with malty undertones.',
  699, 799, 260, 45, 5, 500,
  '["raw","canopy-dew","saranda","woody","mineral-rich"]',
  0, 1,
  'Canopy Dew Forest Honey | SUMOSTA',
  'Indulge in rare, dark Canopy Dew Forest Honey from the Sal forests of Saranda, Jharkhand. Extremely rich in minerals and prebiotics.'
),
(
  'prod_raktbeej_500',
  'Bloodseed Forest Honey',
  'bloodseed-forest-honey',
  'SM-RB-500',
  'cat_raw_honey',
  'Blood-red, therapeutic wild honey from the mysterious Abujhmarh reserves. High iron & antioxidants.',
  'Harvested in the isolated, highly biodiverse forests of Abujhmarh in Chhattisgarh, Bloodseed Forest Honey has a dark, reddish-amber hue. Giant wild bees forage on iron-rich herbal flora and red silk cotton flowers deep within this protected reserve. This honey is prized for its high bio-available iron content, making it an excellent natural blood tonic.',
  699, 799, 320, 35, 5, 500,
  '["raw","bloodseed","abujhmarh","red-honey","therapeutic"]',
  1, 1,
  'Bloodseed Forest Honey | High Iron Wild Honey | SUMOSTA',
  'Taste the therapeutic Bloodseed Forest Honey from Abujhmarh Reserve. Rich in iron & antioxidants, deep red-amber color, ethically wild-harvested.'
),
(
  'prod_trial_box_60g',
  'The 5 Elements Collection',
  '5-elements-collection',
  'SM-TB-5x70',
  'cat_gift_boxes',
  'A luxury nectar flight from India''s pristine forests.',
  'Five rare forest honeys. Five distinct terroirs. One extraordinary collection. The 5 Elements Collection brings together all of SUMOSTA''s single-origin raw honeys in beautiful 70g glass jars — Bloodseed Forest Honey, Artisanal Heritage Forest Honey, Rare Dammer Bee Honey, Canopy Dew Forest Honey, and Organic Wild Forest Honey.',
  499, 599, 300, 50, 5, 350,
  '["gift-box","collection","gifting","sample-pack","5-elements"]',
  1, 1,
  'The 5 Elements Collection | Premium Forest Honey Gift Set | SUMOSTA',
  'Experience all 5 SUMOSTA raw forest honeys in a luxury 70g gift set.'
)
ON CONFLICT(id) DO UPDATE SET
  name                = excluded.name,
  slug                = excluded.slug,
  sku                 = excluded.sku,
  category_id         = excluded.category_id,
  short_description   = excluded.short_description,
  description         = excluded.description,
  price               = excluded.price,
  compare_at_price    = excluded.compare_at_price,
  cost_price          = excluded.cost_price,
  stock               = excluded.stock,
  low_stock_threshold = excluded.low_stock_threshold,
  weight              = excluded.weight,
  tags                = excluded.tags,
  is_featured         = excluded.is_featured,
  is_active           = excluded.is_active,
  meta_title          = excluded.meta_title,
  meta_description    = excluded.meta_description,
  updated_at          = datetime('now');

-- 5) Variants — matches the IDs the site uses when adding-to-cart.
INSERT INTO product_variants (id, product_id, name, sku, price_adjust, stock, sort_order) VALUES
('var_wf_250g', 'prod_wf_honey_500',  '250g Glass Jar', 'SM-WF-250',  -250,  50, 1),
('var_wf_500g', 'prod_wf_honey_500',  '500g Glass Jar', 'SM-WF-500',     0, 100, 2),
('var_st_250g', 'prod_stingless_250', '250g Glass Jar', 'SM-STB-250', -600,  15, 1),
('var_st_500g', 'prod_stingless_250', '500g Glass Jar', 'SM-STB-500',    0,  10, 2),
('var_tb_250g', 'prod_tribal_500',    '250g Glass Jar', 'SM-TF-250',  -300,  40, 1),
('var_tb_500g', 'prod_tribal_500',    '500g Glass Jar', 'SM-TF-500',     0,  40, 2),
('var_hd_250g', 'prod_honeydew_500',  '250g Glass Jar', 'SM-HD-250',  -300,  25, 1),
('var_hd_500g', 'prod_honeydew_500',  '500g Glass Jar', 'SM-HD-500',     0,  20, 2),
('var_rb_250g', 'prod_raktbeej_500',  '250g Glass Jar', 'SM-RB-250',  -300,  25, 1),
('var_rb_500g', 'prod_raktbeej_500',  '500g Glass Jar', 'SM-RB-500',     0,  10, 2);

-- 6) Product images — local Next.js public paths (matches content.ts).
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary) VALUES
('img_wf_1',     'prod_wf_honey_500',  '/images/products/wild-forest-250-hero.png', 'Organic Certified Wild Forest Honey Jar', 1, 1),
('img_st_1',     'prod_stingless_250', '/images/products/dammer-250-hero.png',      'Rare Dammer Bee Honey Jar',              1, 1),
('img_tb_1',     'prod_tribal_500',    '/images/products/heritage-250-hero.png',    'Artisanal Heritage Forest Honey Jar',    1, 1),
('img_hd_1',     'prod_honeydew_500',  '/images/products/canopy-250-hero.png',      'Canopy Dew Forest Honey Jar',            1, 1),
('img_rb_1',     'prod_raktbeej_500',  '/images/products/bloodseed-250-hero.png',   'Bloodseed Forest Honey Jar',             1, 1),
('img_tb_box_1', 'prod_trial_box_60g', '/images/products/wild-forest-250-hero.png', 'The 5 Elements Collection Gift Box',     1, 1);
