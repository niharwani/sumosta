-- Adds a tracking_url column so admins can send a courier tracking link
-- alongside the tracking number in shipped/delivered emails.
ALTER TABLE orders ADD COLUMN tracking_url TEXT;
