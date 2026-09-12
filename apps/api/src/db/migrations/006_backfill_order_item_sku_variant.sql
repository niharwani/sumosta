-- ============================================================
-- Migration 006 — Backfill order_items.sku + variant_name
-- ------------------------------------------------------------
-- Historical bug (fixed in code 2026-09-10): the checkout + razorpay
-- routes wrote product_id into order_items.sku and skipped
-- variant_name entirely. New orders now write the correct values,
-- but every pre-existing order row still renders garbage in the
-- invoice PDF's SKU column ("prod_wf_honey_500" instead of
-- "SM-WF-500") and has no variant tag ("500g Glass Jar" missing).
--
-- Repair by joining on product_variants (preferred) or products,
-- guarded so we never overwrite a row that already looks correct.
--
-- Safe to re-run: guarded by "sku = product_id" and "variant_name IS NULL".
-- Run:
--   wrangler d1 execute sumosta-db --file=src/db/migrations/006_backfill_order_item_sku_variant.sql
-- ============================================================

-- 1) When the order line has a variant, prefer variant SKU + name.
UPDATE order_items
   SET sku          = COALESCE((SELECT pv.sku  FROM product_variants pv WHERE pv.id = order_items.variant_id), sku),
       variant_name = COALESCE(variant_name,
                               (SELECT pv.name FROM product_variants pv WHERE pv.id = order_items.variant_id))
 WHERE variant_id IS NOT NULL
   AND (sku = product_id OR variant_name IS NULL);

-- 2) When there's no variant, use the product SKU. Only overwrite
--    when the stored sku is still the productId (the historical bug
--    signature) so a legitimately-hand-edited row is left alone.
UPDATE order_items
   SET sku = COALESCE((SELECT p.sku FROM products p WHERE p.id = order_items.product_id), sku)
 WHERE variant_id IS NULL
   AND sku = product_id;
