-- ============================================================
-- Migration 007 — Refund tracking on orders
-- ------------------------------------------------------------
-- TC-062 / TC-063: the admin refund endpoint calls Razorpay and
-- flips payment_status → 'refunded' / 'partially_refunded', but
-- never stored the resulting refund id, cumulative amount, or
-- timestamp — so ops had to open the Razorpay dashboard every
-- time to reconcile. This migration adds those three columns so
-- the admin panel + emails can surface refund info directly.
--
-- Run:
--   wrangler d1 execute sumosta-db --file=src/db/migrations/007_refund_tracking.sql
-- ============================================================

ALTER TABLE orders ADD COLUMN razorpay_refund_id TEXT;
ALTER TABLE orders ADD COLUMN refunded_amount    REAL NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN refunded_at        TEXT;
