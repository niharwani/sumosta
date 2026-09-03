-- ============================================================
-- Migration 003 — Invoice numbering + HSN codes (GST compliance)
-- ------------------------------------------------------------
-- GST requires each tax invoice to have a unique, gap-free serial
-- number that resets at the start of every fiscal year
-- (April 1 → March 31 in India). Reusing the customer-facing
-- `order_number` is non-compliant because the order numbering
-- doesn't reset per FY and can have gaps from cancellations.
--
-- • `invoice_counters` — one row per FY, atomically bumped by
--   getOrCreateInvoiceNumber() to mint the next serial.
-- • `orders.invoice_number` — the minted string is cached on the
--   order row so subsequent invoice fetches return the same
--   number.
-- • `products.hsn_code` — HSN classification per SKU. Defaults to
--   NULL; the invoice generator falls back to '0409' (natural
--   honey) when a product row omits it.
--
-- Run:
--   wrangler d1 execute sumosta-db --file=src/db/migrations/003_invoice_counters.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS invoice_counters (
    fiscal_year TEXT PRIMARY KEY,          -- e.g. '25-26'
    last_number INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE orders ADD COLUMN invoice_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_invoice_number ON orders(invoice_number);

ALTER TABLE products ADD COLUMN hsn_code TEXT;
