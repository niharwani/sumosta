-- ============================================================
-- Migration 005 — Shiprocket integration
-- ------------------------------------------------------------
-- Adds columns needed to track auto-created Shiprocket shipments
-- against each order, plus per-product package dimensions used
-- by the courier rate/volumetric weight calculation.
-- ============================================================

-- ORDERS -----------------------------------------------------
-- payment_method: 'razorpay' | 'cod' | 'phonepe'
-- (Was previously derived from column presence — making it explicit
--  so Shiprocket's payment_method field can be set correctly.)
ALTER TABLE orders ADD COLUMN payment_method TEXT;

-- Shiprocket identifiers returned when we create the order + shipment
ALTER TABLE orders ADD COLUMN shiprocket_order_id INTEGER;
ALTER TABLE orders ADD COLUMN shiprocket_shipment_id INTEGER;

-- AWB + courier chosen once we assign one. tracking_number/tracking_url
-- already exist and get populated with the AWB and Shiprocket's public
-- tracking URL respectively, so the existing customer UI keeps working.
ALTER TABLE orders ADD COLUMN awb_code TEXT;
ALTER TABLE orders ADD COLUMN courier_name TEXT;
ALTER TABLE orders ADD COLUMN courier_company_id INTEGER;

-- Shiprocket's own shipment state ("NEW", "PICKUP SCHEDULED", "IN TRANSIT",
-- "DELIVERED", "RTO", etc.) plus when we last synced it.
ALTER TABLE orders ADD COLUMN shipment_status TEXT;
ALTER TABLE orders ADD COLUMN shipment_status_updated_at TEXT;

-- When automation fails, we stash the last error so admins can see why
-- and hit "Retry shipment" from the order detail page.
ALTER TABLE orders ADD COLUMN shipment_last_error TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_awb ON orders(awb_code);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket ON orders(shiprocket_shipment_id);

-- PRODUCTS ---------------------------------------------------
-- Shiprocket needs L × B × H (cm) for volumetric weight. weight (kg) already
-- exists on products. Defaults are conservative honey-jar sizes so shipments
-- can be created even before the client provides real per-SKU dimensions.
ALTER TABLE products ADD COLUMN length_cm REAL NOT NULL DEFAULT 15;
ALTER TABLE products ADD COLUMN width_cm  REAL NOT NULL DEFAULT 12;
ALTER TABLE products ADD COLUMN height_cm REAL NOT NULL DEFAULT 10;
