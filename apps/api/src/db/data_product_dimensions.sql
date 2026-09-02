-- ============================================================
-- Product dimensions + weights from client (2026-09-02)
-- ------------------------------------------------------------
-- Values from a spreadsheet the founders shared. Weights are the
-- PACKAGED weight (jar + box + wrap), not just the honey content
-- — which is what Shiprocket needs. Original values were in grams;
-- stored here as kilograms so Shiprocket's payload math is direct.
--
-- 250g honey (1 SKU) — Rare Dammer Bee
-- 500g honey (4 SKUs) — Wild Forest, Bloodseed, Canopy Dew, Heritage
-- Trial pack (1 SKU) — The 5 Elements Collection (5 × 70g)
-- ============================================================

-- 500g SKUs: 9.5 × 10 × 21.5 cm, 0.87 kg packaged
UPDATE products
SET length_cm = 9.5, width_cm = 10, height_cm = 21.5, weight = 0.87
WHERE sku IN ('SM-TF-500', 'SM-RB-500', 'SM-HD-500', 'SM-WF-500');

-- 250g SKU: 9.5 × 10 × 14 cm, 0.5 kg packaged
UPDATE products
SET length_cm = 9.5, width_cm = 10, height_cm = 14, weight = 0.5
WHERE sku = 'SM-STB-250';

-- Trial pack (5 × 70g): 10 × 15 × 10 cm, 0.9 kg packaged
UPDATE products
SET length_cm = 10, width_cm = 15, height_cm = 10, weight = 0.9
WHERE sku = 'SM-TB-5x70';
