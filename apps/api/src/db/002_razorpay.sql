-- ============================================================
-- Migration 002: Razorpay columns on orders
-- Run with: wrangler d1 execute sumosta-db --file src/db/002_razorpay.sql --remote
-- (drop --remote for the local dev DB)
-- ============================================================

ALTER TABLE orders ADD COLUMN razorpay_order_id   TEXT;
ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN razorpay_signature  TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay ON orders(razorpay_order_id);
