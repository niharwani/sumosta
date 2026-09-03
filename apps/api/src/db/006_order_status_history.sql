-- ============================================================
-- Migration 006 — Order status transition history
-- ------------------------------------------------------------
-- Records every status transition on an order so the admin can
-- see who changed what and when (admin action, Razorpay verify,
-- Shiprocket webhook, etc.).
--
-- Also adds a `stock_restored` flag on orders so we can safely
-- reverse the stock deduction exactly once when an order is
-- cancelled or refunded from a stock-deducted state.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_status_history (
    id          TEXT PRIMARY KEY,
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status   TEXT NOT NULL,
    changed_by  TEXT,                                    -- users.id of the admin, NULL for system/webhook
    note        TEXT,
    changed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order
    ON order_status_history(order_id);

-- Guard flag for the stock-restoration path. 0 by default; flipped to 1
-- when we run the stock reversal batch for cancelled/refunded orders.
ALTER TABLE orders ADD COLUMN stock_restored INTEGER NOT NULL DEFAULT 0;
