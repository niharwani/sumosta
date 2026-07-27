-- ============================================================
-- SUMOSTA PRODUCT DATA UPDATE — from Honey Pricing & discounts PDF
-- Clears all random seed data and inserts real product catalog
-- Run: wrangler d1 execute sumosta-db --remote --file=src/db/update_products.sql
-- ============================================================

-- Step 1: Clear all product-related data (safe order for D1/SQLite)
DELETE FROM product_images;
DELETE FROM reviews;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM coupons;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
(
  'cat_raw_honey',
  'Raw Honey',
  'raw-honey',
  'Single-origin wild forest honeys from India''s most pristine and biodiverse ecosystems',
  1
),
(
  'cat_gift_boxes',
  'Gift Boxes',
  'gift-boxes',
  'Curated honey gift combos — the perfect gift for every occasion',
  2
);

-- ============================================================
-- PRODUCTS — Honey Glass Jars 500g
-- price = Selling Price, compare_at_price = MRP
-- ============================================================
INSERT INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, low_stock_threshold, weight, is_featured, is_active, tags) VALUES
(
  'prod_owf_500',
  'Organic Wild Forest Honey — 500g',
  'organic-wild-forest-honey-500g',
  'OWF-500',
  'cat_raw_honey',
  'NPOP & APEDA certified organic wild forest honey. Cold-extracted, unprocessed, and completely additive-free.',
  'Harvested from certified organic wild forest colonies, this honey carries India''s most prestigious organic certifications — NPOP and APEDA. Cold-extracted and never pasteurized, it preserves all naturally occurring enzymes, antioxidants, and wild pollen. A rich, complex flavor with warm floral notes and a long, clean finish. Every batch is traceable to its forest apiary.',
  599, 699, 150, 10, 500, 1, 1,
  '["organic","certified","npop","apeda","500g","wild-forest","bestseller"]'
),
(
  'prod_rdb_500',
  'Rare Dammer Bee Honey — 500g',
  'rare-dammer-bee-honey-500g',
  'RDB-500',
  'cat_raw_honey',
  'Exceptionally rare honey from stingless Dammer bees of Nagaland. A true collector''s treasure.',
  'Among the rarest honeys in the world, Dammer bee honey is produced by tiny stingless bees indigenous to the forests of Nagaland. These bees produce honey in very small quantities, giving it a distinctive tangy-sweet flavor unlike any conventional honey. Rich in antimicrobial properties and treasured in traditional Naga medicine, each jar is a limited edition. Available in extremely small batches.',
  1399, 1699, 30, 5, 500, 1, 1,
  '["rare","dammer","stingless-bee","nagaland","500g","collector","limited"]'
),
(
  'prod_ahf_500',
  'Artisanal Heritage Forest Honey — 500g',
  'artisanal-heritage-forest-honey-500g',
  'AHF-500',
  'cat_raw_honey',
  'Wild honey from the ancient Kandhamal forests of Odisha. Deep, dark, and richly complex.',
  'Sourced from the biodiverse Kandhamal forest of Odisha — a region celebrated for its extraordinary floral diversity — this honey has a deep amber color and a bold, complex flavor that reflects the wild forests where it was made. Harvested by indigenous tribal beekeepers using ancestral techniques passed down over generations.',
  699, 799, 80, 10, 500, 0, 1,
  '["artisanal","heritage","kandhamal","odisha","500g","tribal","forest"]'
),
(
  'prod_cdf_500',
  'Canopy Dew Forest Honey — 500g',
  'canopy-dew-forest-honey-500g',
  'CDF-500',
  'cat_raw_honey',
  'Single-origin honey from the dense Saranda forests of Jharkhand. Light, fresh, and beautifully floral.',
  'The Saranda forest in Jharkhand — one of Asia''s largest sal forest tracts — gives this honey its signature character: a light, fresh sweetness with delicate floral and woody notes. Bees forage freely across the dense canopy, collecting nectar from hundreds of wild plant species. The result is a honey that tastes like the forest itself. Unprocessed and cold-extracted.',
  699, 799, 80, 10, 500, 0, 1,
  '["saranda","jharkhand","forest","500g","floral","light","canopy"]'
),
(
  'prod_bsf_500',
  'Bloodseed Forest Honey — 500g',
  'bloodseed-forest-honey-500g',
  'BSF-500',
  'cat_raw_honey',
  'Wild honey from the remote Abujhmarh forests of Chhattisgarh. Bold, earthy, and deeply wild.',
  'From one of India''s most remote and untouched forest ecosystems — the Abujhmarh in Chhattisgarh — comes this bold, earthy honey with remarkable depth. The Abujhmarh is home to rare flora found nowhere else on Earth, giving this honey a distinctive, powerful terroir. Harvested by the indigenous Gondi people using traditional methods that have remained unchanged for centuries.',
  699, 799, 70, 10, 500, 0, 1,
  '["abujhmarh","chhattisgarh","wild","500g","tribal","bold","earthy"]'
);

-- ============================================================
-- PRODUCTS — Honey Glass Jars 250g
-- ============================================================
INSERT INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, low_stock_threshold, weight, is_featured, is_active, tags) VALUES
(
  'prod_owf_250',
  'Organic Wild Forest Honey — 250g',
  'organic-wild-forest-honey-250g',
  'OWF-250',
  'cat_raw_honey',
  'NPOP & APEDA certified organic wild forest honey in a 250g jar. Perfect introduction to SUMOSTA.',
  'The same NPOP and APEDA certified organic wild forest honey, now available in a convenient 250g jar. Perfect for first-timers, gifting, or for those who want to try before committing to a larger jar. Cold-extracted, unprocessed, and completely additive-free.',
  349, 399, 150, 15, 250, 0, 1,
  '["organic","certified","npop","apeda","250g","wild-forest"]'
),
(
  'prod_rdb_250',
  'Rare Dammer Bee Honey — 250g',
  'rare-dammer-bee-honey-250g',
  'RDB-250',
  'cat_raw_honey',
  'Exceptionally rare stingless Dammer bee honey from Nagaland in a 250g jar.',
  'The rarest honey we offer — produced by tiny stingless Dammer bees from the forests of Nagaland — now in a 250g jar. An exceptional gift or personal indulgence. Distinctive tangy-sweet flavor, rich in antimicrobial properties. Very limited availability — order early to avoid disappointment.',
  799, 899, 30, 5, 250, 0, 1,
  '["rare","dammer","stingless-bee","nagaland","250g","collector","limited"]'
),
(
  'prod_ahf_250',
  'Artisanal Heritage Forest Honey — 250g',
  'artisanal-heritage-forest-honey-250g',
  'AHF-250',
  'cat_raw_honey',
  'Wild honey from Kandhamal Forest, Odisha in a 250g jar. Deep, dark, and richly flavored.',
  'The same exceptional Kandhamal forest honey from Odisha, now in a 250g jar. A wonderful way to explore one of India''s most distinctive regional honeys, or a perfect addition to a curated gift hamper. Harvested by tribal beekeepers, cold-extracted, and unprocessed.',
  399, 449, 80, 10, 250, 0, 1,
  '["artisanal","heritage","kandhamal","odisha","250g","tribal","forest"]'
),
(
  'prod_cdf_250',
  'Canopy Dew Forest Honey — 250g',
  'canopy-dew-forest-honey-250g',
  'CDF-250',
  'cat_raw_honey',
  'Fresh, floral honey from Saranda Forest, Jharkhand in a convenient 250g jar.',
  'Light, fresh, and beautifully floral — the Saranda forest honey from Jharkhand in a convenient 250g jar. Ideal for gifting or for those wanting to explore this unique regional honey before choosing a larger size.',
  399, 449, 80, 10, 250, 0, 1,
  '["saranda","jharkhand","forest","250g","floral","light"]'
),
(
  'prod_bsf_250',
  'Bloodseed Forest Honey — 250g',
  'bloodseed-forest-honey-250g',
  'BSF-250',
  'cat_raw_honey',
  'Bold, earthy wild honey from Abujhmarh Forest, Chhattisgarh in a 250g jar.',
  'The bold, earthy character of Abujhmarh forest honey in a convenient 250g jar. Perfect for those wanting to experience one of India''s most remote and untouched forest ecosystems through its honey.',
  399, 449, 70, 10, 250, 0, 1,
  '["abujhmarh","chhattisgarh","wild","250g","tribal","bold"]'
);

-- ============================================================
-- PRODUCTS — Gift Combos
-- ============================================================
INSERT INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, low_stock_threshold, is_featured, is_active, tags) VALUES
(
  'prod_gift_nrt',
  'Nature''s Rare Treasures — The Ultimate Honey Duo',
  'natures-rare-treasures-honey-duo',
  'GIFT-NRT',
  'cat_gift_boxes',
  'The Ultimate Honey Duo — Rare Dammer Bee Honey + Canopy Dew Forest Honey (250g each). Use COMBO10 for extra 10% off.',
  'Two of India''s rarest and most distinctive honeys, presented together in our signature gift packaging. Includes: Rare Dammer Bee Honey 250g (from stingless bees of Nagaland) + Canopy Dew Forest Honey 250g (from the Saranda forests of Jharkhand). A truly extraordinary gift for the discerning honey lover. Apply coupon code COMBO10 at checkout for an additional 10% off.',
  999, 1299, 40, 5, 1, 1,
  '["gift","combo","duo","rare","dammer","canopy-dew","250g","gifting"]'
),
(
  'prod_gift_ht',
  'The Heritage Trio — Purely Wild. Deeply Rooted.',
  'the-heritage-trio-honey-gift',
  'GIFT-HT',
  'cat_gift_boxes',
  'Three iconic wild forest honeys — Organic Wild + Bloodseed + Artisanal Heritage (250g each). Use COMBO10 for extra 10% off.',
  'A journey through India''s most iconic wild forest ecosystems in a single gift box. Includes: Organic Wild Forest Honey 250g (NPOP & APEDA certified) + Bloodseed Forest Honey 250g (Abujhmarh, Chhattisgarh) + Artisanal Heritage Forest Honey 250g (Kandhamal, Odisha). Beautifully presented in our premium gift packaging. Apply coupon code COMBO10 at checkout for an additional 10% off.',
  999, 1299, 40, 5, 1, 1,
  '["gift","combo","trio","heritage","wild","organic","250g","gifting"]'
),
(
  'prod_gift_5e',
  'The 5 Elements Collection — Luxury Nectar Flight',
  'the-5-elements-collection',
  'GIFT-5E',
  'cat_gift_boxes',
  'A luxury nectar flight from India''s pristine forests — all 5 honeys in elegant 70g tasting jars.',
  'Experience all five of our signature forest honeys in one extraordinary tasting set. Each jar contains 70g of a different single-origin wild forest honey: Organic Wild Forest Honey, Rare Dammer Bee Honey, Canopy Dew Forest Honey, Artisanal Heritage Forest Honey, and Bloodseed Forest Honey. The ultimate introduction to India''s rarest honeys — beautifully presented in a luxury gift box.',
  499, 599, 30, 5, 1, 1,
  '["gift","tasting","flight","five","70g","luxury","collection","nectar"]'
);

-- ============================================================
-- COUPONS
-- ============================================================
INSERT INTO coupons (id, code, type, value, min_order_amount, max_usage, usage_count, is_first_order_only, is_active) VALUES
-- 10% off first order (tied to phone/OTP validation in checkout flow)
('cpn_welcome10', 'WELCOME10', 'percentage', 10, NULL, NULL, 0, 1, 1),
-- 10% off on gifting combos (not applicable on GIFT-5E — enforced at checkout)
('cpn_combo10',   'COMBO10',   'percentage', 10, NULL, NULL, 0, 0, 1),
-- 5% off on UPI / prepaid payments
('cpn_prepaid5',  'PREPAID5',  'percentage',  5, NULL, NULL, 0, 0, 1);
