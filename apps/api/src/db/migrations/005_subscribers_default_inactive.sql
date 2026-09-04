-- ============================================================
-- Migration — normalise subscribers.is_active default to 0
-- ------------------------------------------------------------
-- The table was originally created with `is_active INTEGER DEFAULT 1`,
-- which is preserved on production even though schema.sql now specifies
-- `DEFAULT 0`. Because SQLite has no ALTER COLUMN, we rebuild the table.
--
-- Application code always binds `is_active` explicitly, so this migration
-- is defensive: any future INSERT that omits the column will now default
-- to pending (matching double-opt-in) instead of silently marking the
-- subscriber active.
--
-- Existing rows are preserved verbatim — their current is_active value
-- (0 or 1) is copied over unchanged.
--
-- Run:
--   wrangler d1 execute sumosta-db --remote \
--     --file=src/db/migrations/005_subscribers_default_inactive.sql
-- ============================================================

CREATE TABLE subscribers_new (
    id                TEXT PRIMARY KEY,
    email             TEXT UNIQUE NOT NULL,
    is_active         INTEGER NOT NULL DEFAULT 0,
    source            TEXT NOT NULL DEFAULT 'website',
    confirm_token     TEXT,
    unsubscribe_token TEXT,
    confirmed_at      TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO subscribers_new
    (id, email, is_active, source, confirm_token, unsubscribe_token, confirmed_at, created_at)
SELECT
    id, email, is_active, source, confirm_token, unsubscribe_token, confirmed_at, created_at
FROM subscribers;

DROP TABLE subscribers;

ALTER TABLE subscribers_new RENAME TO subscribers;

CREATE INDEX IF NOT EXISTS idx_subscribers_confirm_token
    ON subscribers(confirm_token);

CREATE INDEX IF NOT EXISTS idx_subscribers_unsub_token
    ON subscribers(unsubscribe_token);
