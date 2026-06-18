-- ============================================================
-- SUMOSTA SEED DATA
-- Run AFTER schema.sql
-- wrangler d1 execute sumosta-db --file=src/db/seed.sql
-- ============================================================

-- ============================================================
-- ADMIN USER
-- Password: admin123 (bcrypt hash — CHANGE ON FIRST LOGIN)
-- ============================================================
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role)
VALUES (
    'usr_admin_001',
    'SUMOSTA Admin',
    'admin@sumosta.com',
    '9999999999',
    '$2a$10$0sdgxVLHTIc5OPDzCz0Yo.4IcUCamIGh3Cl1DxHxw6zFfWmqsPS1C',
    'superadmin'
);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT OR IGNORE INTO categories (id, name, slug, description, sort_order) VALUES
('cat_raw_honey',     'Raw Honey',      'raw-honey',      'Pure, unprocessed honey from wild bee colonies', 1),
('cat_honey_sticks',  'Honey Sticks',   'honey-sticks',   'Convenient single-serve honey sticks',          2),
('cat_honey_spreads', 'Honey Spreads',  'honey-spreads',  'Infused honey spreads with natural flavors',    3),
('cat_honeycomb',     'Honeycomb',      'honeycomb',      'Raw honeycomb pieces straight from the hive',   4),
('cat_gift_boxes',    'Gift Boxes',     'gift-boxes',     'Curated honey gift sets for every occasion',    5);

-- ============================================================
-- PRODUCTS — Raw Honey
-- ============================================================
INSERT OR IGNORE INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, is_featured, tags)
VALUES
(
    'prod_wg_honey_500',
    'Western Ghats Raw Honey',
    'western-ghats-raw-honey-500g',
    'WG-RAW-500',
    'cat_raw_honey',
    'Single-origin raw honey from the biodiverse Western Ghats. Rich, dark, and deeply floral.',
    'Sourced from wild bee colonies nestled in the ancient forests of the Western Ghats, this honey captures the essence of one of the world''s biodiversity hotspots. Cold-extracted and unpasteurized, it retains all naturally occurring enzymes, antioxidants, and pollen. Expect a complex flavor profile — dark fruits, wild flowers, and a warm, lingering sweetness.',
    599, 749, 150, 1,
    '["raw", "western-ghats", "single-origin", "unprocessed"]'
),
(
    'prod_wg_honey_1kg',
    'Western Ghats Raw Honey — 1kg',
    'western-ghats-raw-honey-1kg',
    'WG-RAW-1KG',
    'cat_raw_honey',
    'Our bestselling Western Ghats honey in a family-sized 1kg jar.',
    'The same exceptional Western Ghats raw honey, now in a generous 1kg jar. Perfect for families or gifting. Cold-extracted, unpasteurized, and completely additive-free.',
    999, 1299, 80, 1,
    '["raw", "western-ghats", "single-origin", "family-size"]'
),
(
    'prod_himalayan_honey',
    'Himalayan Wild Honey',
    'himalayan-wild-honey-500g',
    'HIM-WILD-500',
    'cat_raw_honey',
    'Rare wild honey from Himalayan foothills. Light, delicate, and high in altitude flavors.',
    'Harvested by traditional beekeepers from the pristine Himalayan foothills, this wild honey is unlike anything you''ve tasted. Its altitude gives it a uniquely delicate floral character — light amber, subtly sweet, with a clean finish. Limited batch production means each jar is a numbered collectible.',
    699, null, 60, 0,
    '["raw", "himalayan", "wild", "rare"]'
),
(
    'prod_sundarbans_honey',
    'Sundarbans Mangrove Honey',
    'sundarbans-mangrove-honey-500g',
    'SUN-MANG-500',
    'cat_raw_honey',
    'Unique mangrove honey from the Sundarbans delta. Earthy, bold, with coastal complexity.',
    'The Sundarbans — the world''s largest mangrove forest — produces a honey unlike any other. Dark, bold, and rich with the complex botanical character of mangrove flowers. This honey has a unique earthy depth that pairs beautifully with strong cheese, dark bread, or simply eaten by the spoonful.',
    549, null, 90, 0,
    '["raw", "sundarbans", "mangrove", "bold"]'
);

-- ============================================================
-- PRODUCTS — Honey Sticks
-- ============================================================
INSERT OR IGNORE INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, is_featured, tags)
VALUES
(
    'prod_sticks_classic_10',
    'Classic Honey Sticks — 10 Pack',
    'classic-honey-sticks-10-pack',
    'STK-CLS-10',
    'cat_honey_sticks',
    'Pure raw honey in convenient single-serve sticks. Perfect for tea, travel, or on-the-go.',
    'Each stick contains exactly one teaspoon of our raw Western Ghats honey, sealed fresh in BPA-free tubes. Tear and squeeze directly into your tea, coffee, or yogurt. Perfect for travel, office, or gifting. No mess, no waste — just pure honey.',
    199, 249, 300, 1,
    '["honey-sticks", "travel", "convenient", "raw"]'
),
(
    'prod_sticks_assorted_20',
    'Assorted Flavor Honey Sticks — 20 Pack',
    'assorted-flavor-honey-sticks-20-pack',
    'STK-ASST-20',
    'cat_honey_sticks',
    '20 sticks in 4 flavors: Original, Cinnamon, Vanilla, and Ginger. A taster''s delight.',
    'Can''t pick just one? Our 20-pack Assorted gives you 5 sticks each of Original Raw, Cinnamon Spice, Madagascar Vanilla, and Ginger Lemon. Perfect as a gift or for discovering your favorite. Each stick is individually sealed for maximum freshness.',
    449, 549, 200, 1,
    '["honey-sticks", "assorted", "gift", "flavored"]'
);

-- ============================================================
-- PRODUCTS — Honey Spreads
-- ============================================================
INSERT OR IGNORE INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, is_featured, tags)
VALUES
(
    'prod_spread_cinnamon',
    'Cinnamon Honey Spread',
    'cinnamon-honey-spread-250g',
    'SPR-CIN-250',
    'cat_honey_spreads',
    'Raw honey whipped with Ceylon cinnamon. Warm, aromatic, and naturally anti-inflammatory.',
    'We slowly whip our raw Western Ghats honey with authentic Ceylon cinnamon (the true cinnamon, not cassia). The result is a creamy, spreadable honey with a warm, spicy sweetness that elevates everything from morning toast to overnight oats. Ceylon cinnamon is known for its anti-inflammatory properties and gentle, complex flavor.',
    399, null, 120, 0,
    '["spread", "cinnamon", "creamy", "breakfast"]'
),
(
    'prod_spread_vanilla',
    'Vanilla Bean Honey Spread',
    'vanilla-bean-honey-spread-250g',
    'SPR-VAN-250',
    'cat_honey_spreads',
    'Raw honey with real Madagascar vanilla beans. Luxurious, floral, and impossibly good.',
    'Real Madagascar vanilla beans — not extract, not flavoring — are hand-scraped and folded into our whipped raw honey. The result is a luxuriously fragrant spread with visible vanilla specks. Use it on warm bread, as a cake filling, stirred into warm milk, or eaten straight from the jar. We won''t judge.',
    399, null, 100, 0,
    '["spread", "vanilla", "luxurious", "dessert"]'
),
(
    'prod_spread_cardamom',
    'Cardamom Honey Spread',
    'cardamom-honey-spread-250g',
    'SPR-CARD-250',
    'cat_honey_spreads',
    'Raw honey with freshly ground green cardamom. A South Indian-inspired pairing.',
    'Fresh green cardamom pods are ground daily and folded into whipped raw honey, creating a fragrant, slightly floral spread with deep South Indian roots. Extraordinary with filter coffee, parathas, or as a finishing drizzle on desserts.',
    399, null, 90, 0,
    '["spread", "cardamom", "indian", "fragrant"]'
),
(
    'prod_spread_turmeric',
    'Turmeric Golden Honey Spread',
    'turmeric-golden-honey-spread-250g',
    'SPR-TUR-250',
    'cat_honey_spreads',
    'Raw honey with organic turmeric and black pepper. Ancient wellness in a modern jar.',
    'Inspired by the ancient Ayurvedic tradition of golden milk, we''ve combined raw honey with organic turmeric and a pinch of black pepper (which activates curcumin absorption). The result is a golden, earthy spread with remarkable wellness properties. Mix into warm milk for a soothing night drink, or spread on toast for a vibrant breakfast.',
    449, null, 85, 1,
    '["spread", "turmeric", "wellness", "ayurvedic"]'
);

-- ============================================================
-- PRODUCTS — Honeycomb
-- ============================================================
INSERT OR IGNORE INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, is_featured, tags)
VALUES
(
    'prod_honeycomb',
    'Raw Honeycomb Piece',
    'raw-honeycomb-piece-250g',
    'HNY-COMB-250',
    'cat_honeycomb',
    'Fresh cut honeycomb — honey in its most natural form, sealed in beeswax cells.',
    'This is honey at its most elemental — sealed inside the beeswax cells where it was made. Our honeycomb is cut fresh from hive frames, packed immediately, and never heated. Each 250g piece is a complete edible structure: the beeswax is safe to eat and adds a subtle, pleasant texture. Pair with aged cheese, fresh figs, or dark bread.',
    799, 999, 40, 1,
    '["honeycomb", "raw", "artisanal", "premium"]'
);

-- ============================================================
-- PRODUCTS — Gift Boxes
-- ============================================================
INSERT OR IGNORE INTO products (id, name, slug, sku, category_id, short_description, description, price, compare_at_price, stock, is_featured, tags)
VALUES
(
    'prod_gift_essentials',
    'The Essentials Gift Box',
    'the-essentials-gift-box',
    'GIFT-ESS-001',
    'cat_gift_boxes',
    '3 jars of our most beloved honeys, beautifully packaged. The perfect introduction to SUMOSTA.',
    'Three of our most beloved honeys — Western Ghats Raw (500g), Cinnamon Spread (250g), and Classic Honey Sticks 10-pack — presented in our signature kraft-and-honey packaging. Includes a handwritten card (add your message at checkout). Ships in a fully recyclable gift box.',
    1499, 1799, 50, 1,
    '["gift", "bestseller", "introduction", "premium"]'
),
(
    'prod_gift_connoisseur',
    'The Connoisseur Gift Box',
    'the-connoisseur-gift-box',
    'GIFT-CON-001',
    'cat_gift_boxes',
    'Our most comprehensive gift — 5 jars, honeycomb, and honey sticks. For the true honey lover.',
    'Everything we make, in one extraordinary box. Includes: Western Ghats Raw (500g), Himalayan Wild (500g), Sundarbans Mangrove (500g), Vanilla Bean Spread (250g), Turmeric Golden Spread (250g), Raw Honeycomb (250g), and Assorted Sticks 20-pack. Presented in our premium rigid gift box with a gold ribbon. The ultimate honey experience.',
    2999, 3599, 25, 1,
    '["gift", "premium", "luxury", "complete"]'
);

-- ============================================================
-- PRODUCT IMAGES (placeholders — will be replaced with R2 URLs)
-- ============================================================
INSERT OR IGNORE INTO product_images (id, product_id, url, alt_text, sort_order, is_primary) VALUES
('img_wg_1',   'prod_wg_honey_500',      '/images/products/western-ghats-honey.jpg',       'Western Ghats Raw Honey 500g jar', 0, 1),
('img_wg_2',   'prod_wg_honey_1kg',      '/images/products/western-ghats-honey-1kg.jpg',   'Western Ghats Raw Honey 1kg jar',  0, 1),
('img_him_1',  'prod_himalayan_honey',   '/images/products/himalayan-honey.jpg',            'Himalayan Wild Honey 500g jar',    0, 1),
('img_sun_1',  'prod_sundarbans_honey',  '/images/products/sundarbans-honey.jpg',           'Sundarbans Mangrove Honey 500g',   0, 1),
('img_stk_1',  'prod_sticks_classic_10', '/images/products/honey-sticks-classic.jpg',       'Classic Honey Sticks 10 Pack',     0, 1),
('img_stk_2',  'prod_sticks_assorted_20','/images/products/honey-sticks-assorted.jpg',      'Assorted Flavor Honey Sticks',     0, 1),
('img_cin_1',  'prod_spread_cinnamon',   '/images/products/cinnamon-honey-spread.jpg',      'Cinnamon Honey Spread 250g',       0, 1),
('img_van_1',  'prod_spread_vanilla',    '/images/products/vanilla-honey-spread.jpg',       'Vanilla Bean Honey Spread 250g',   0, 1),
('img_card_1', 'prod_spread_cardamom',   '/images/products/cardamom-honey-spread.jpg',      'Cardamom Honey Spread 250g',       0, 1),
('img_tur_1',  'prod_spread_turmeric',   '/images/products/turmeric-honey-spread.jpg',      'Turmeric Golden Honey Spread 250g',0, 1),
('img_hc_1',   'prod_honeycomb',         '/images/products/raw-honeycomb.jpg',              'Raw Honeycomb Piece 250g',         0, 1),
('img_ge_1',   'prod_gift_essentials',   '/images/products/essentials-gift-box.jpg',        'The Essentials Gift Box',          0, 1),
('img_gc_1',   'prod_gift_connoisseur',  '/images/products/connoisseur-gift-box.jpg',       'The Connoisseur Gift Box',         0, 1);

-- ============================================================
-- COUPONS
-- ============================================================
INSERT OR IGNORE INTO coupons (id, code, type, value, min_order_amount, is_first_order_only, is_active) VALUES
('cpn_welcome', 'WELCOME10', 'percentage', 10, null, 1, 1),
('cpn_honey20', 'HONEY20',   'fixed',      200, 1000, 0, 1);
