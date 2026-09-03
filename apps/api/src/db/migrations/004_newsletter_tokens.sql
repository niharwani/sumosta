-- ============================================================
-- Migration — Newsletter double-opt-in + unsubscribe tokens
-- ------------------------------------------------------------
-- Adds double-opt-in (CAN-SPAM/GDPR) support to the `subscribers`
-- table. New subscribers land as `is_active = 0` with a
-- `confirm_token`; they become active only after clicking the
-- confirmation link. Every subscriber also gets a persistent
-- `unsubscribe_token` for one-click unsubscribe from marketing
-- footers and the List-Unsubscribe header.
--
-- Run:
--   wrangler d1 execute sumosta-db --file=src/db/migrations/004_newsletter_tokens.sql
-- ============================================================

-- `is_active` already exists on `subscribers` (default 1 in schema.sql).
-- Existing rows keep their current value so previously-subscribed users
-- are not unsubscribed by this migration. New rows inserted by the API
-- explicitly set is_active = 0 until the confirm link is clicked.

ALTER TABLE subscribers ADD COLUMN confirm_token     TEXT;
ALTER TABLE subscribers ADD COLUMN unsubscribe_token TEXT;
ALTER TABLE subscribers ADD COLUMN confirmed_at      TEXT;

CREATE INDEX IF NOT EXISTS idx_subscribers_confirm_token
    ON subscribers(confirm_token);

CREATE INDEX IF NOT EXISTS idx_subscribers_unsub_token
    ON subscribers(unsubscribe_token);
