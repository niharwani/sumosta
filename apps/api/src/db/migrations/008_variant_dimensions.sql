-- ============================================================
-- Migration 008 — Per-variant weight + package dimensions
-- ------------------------------------------------------------
-- Until now dimensions/weight were stored per-product only, so
-- Shiprocket was told the same parcel size for a 250g variant and
-- a 500g variant of the same honey — over-declaring the smaller
-- jar's volumetric weight. This migration adds nullable columns
-- to `product_variants`; shipment-automation prefers these over
-- the product row when set.
--
-- Populates the known variant sizes for the current catalog:
--   250g honey jar → 9.5×10×14 cm, 0.5 kg
--   500g honey jar → 9.5×10×21.5 cm, 0.87 kg
-- Anything else stays NULL and falls back to product-level dims.
-- Also fixes prod_stingless_250 whose product row had weight=500
-- (grams) instead of the kg unit Shiprocket expects.
--
-- Run:
--   wrangler d1 execute sumosta-db --file=src/db/migrations/008_variant_dimensions.sql
-- ============================================================

ALTER TABLE product_variants ADD COLUMN weight    REAL;
ALTER TABLE product_variants ADD COLUMN length_cm REAL;
ALTER TABLE product_variants ADD COLUMN width_cm  REAL;
ALTER TABLE product_variants ADD COLUMN height_cm REAL;

-- Backfill: match by size token in the variant name.
UPDATE product_variants
   SET weight    = 0.5,
       length_cm = 9.5,
       width_cm  = 10,
       height_cm = 14
 WHERE LOWER(name) LIKE '%250g%'
    OR LOWER(name) LIKE '%250 g%';

UPDATE product_variants
   SET weight    = 0.87,
       length_cm = 9.5,
       width_cm  = 10,
       height_cm = 21.5
 WHERE LOWER(name) LIKE '%500g%'
    OR LOWER(name) LIKE '%500 g%';

-- Fix the historical Dammer weight-unit bug (500 was grams; kg needed).
UPDATE products
   SET weight = 0.5
 WHERE id = 'prod_stingless_250' AND weight > 10;
