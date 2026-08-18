-- ============================================================
-- SUMOSTA D1 DATABASE SCHEMA
-- Run: wrangler d1 execute sumosta-db --file=src/db/schema.sql
-- ============================================================


-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    phone        TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'customer',  -- 'customer' | 'admin' | 'superadmin'
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    slug         TEXT UNIQUE NOT NULL,
    description  TEXT,
    image_url    TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id                   TEXT PRIMARY KEY,
    name                 TEXT NOT NULL,
    slug                 TEXT UNIQUE NOT NULL,
    sku                  TEXT UNIQUE NOT NULL,
    category_id          TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    short_description    TEXT NOT NULL DEFAULT '',
    description          TEXT NOT NULL DEFAULT '',
    price                REAL NOT NULL,
    compare_at_price     REAL,
    cost_price           REAL,
    stock                INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold  INTEGER NOT NULL DEFAULT 5,
    weight               REAL,                            -- kg (Shiprocket unit)
    length_cm            REAL NOT NULL DEFAULT 15,        -- package L (cm) — Shiprocket volumetric weight
    width_cm             REAL NOT NULL DEFAULT 12,        -- package B (cm)
    height_cm            REAL NOT NULL DEFAULT 10,        -- package H (cm)
    tags                 TEXT NOT NULL DEFAULT '[]',   -- JSON array
    is_featured          INTEGER NOT NULL DEFAULT 0,
    is_active            INTEGER NOT NULL DEFAULT 1,
    meta_title           TEXT,
    meta_description     TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id          TEXT PRIMARY KEY,
    product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    alt_text    TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
    id            TEXT PRIMARY KEY,
    product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    sku           TEXT UNIQUE NOT NULL,
    price_adjust  REAL NOT NULL DEFAULT 0,
    stock         INTEGER NOT NULL DEFAULT 0,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    address_line1   TEXT NOT NULL,
    address_line2   TEXT,
    city            TEXT NOT NULL,
    state           TEXT NOT NULL,
    pincode         TEXT NOT NULL,
    is_default      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id                 TEXT PRIMARY KEY,
    code               TEXT UNIQUE NOT NULL,
    type               TEXT NOT NULL,   -- 'percentage' | 'fixed'
    value              REAL NOT NULL,
    min_order_amount   REAL,
    max_usage          INTEGER,
    usage_count        INTEGER NOT NULL DEFAULT 0,
    is_first_order_only INTEGER NOT NULL DEFAULT 0,
    is_active          INTEGER NOT NULL DEFAULT 1,
    expires_at         TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id                        TEXT PRIMARY KEY,
    order_number              TEXT UNIQUE NOT NULL,
    user_id                   TEXT REFERENCES users(id) ON DELETE SET NULL,
    guest_email               TEXT,
    status                    TEXT NOT NULL DEFAULT 'pending',
    payment_status            TEXT NOT NULL DEFAULT 'pending',
    shipping_name             TEXT NOT NULL,
    shipping_phone            TEXT NOT NULL,
    shipping_address_line1    TEXT NOT NULL,
    shipping_address_line2    TEXT,
    shipping_city             TEXT NOT NULL,
    shipping_state            TEXT NOT NULL,
    shipping_pincode          TEXT NOT NULL,
    subtotal                  REAL NOT NULL,
    discount                  REAL NOT NULL DEFAULT 0,
    shipping_amount           REAL NOT NULL DEFAULT 0,
    tax                       REAL NOT NULL DEFAULT 0,
    total                     REAL NOT NULL,
    coupon_code               TEXT,
    payment_method            TEXT,                       -- 'razorpay' | 'cod' | 'phonepe'
    tracking_number           TEXT,                       -- AWB (mirrors awb_code) — kept for backward compat
    tracking_url              TEXT,                       -- Shiprocket's public tracking URL
    estimated_delivery_date   TEXT,
    phonepe_merchant_txn_id   TEXT UNIQUE,
    phonepe_txn_id            TEXT,
    razorpay_order_id         TEXT,
    razorpay_payment_id       TEXT,
    razorpay_signature        TEXT,
    shiprocket_order_id       INTEGER,
    shiprocket_shipment_id    INTEGER,
    awb_code                  TEXT,
    courier_name              TEXT,
    courier_company_id        INTEGER,
    shipment_status           TEXT,                       -- Shiprocket state, e.g. "PICKUP SCHEDULED"
    shipment_status_updated_at TEXT,
    shipment_last_error       TEXT,                       -- populated when automation fails
    paid_at                   TEXT,
    shipped_at                TEXT,
    delivered_at              TEXT,
    created_at                TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at                TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment    ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_number     ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phonepe    ON orders(phonepe_merchant_txn_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay   ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb        ON orders(awb_code);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket ON orders(shiprocket_shipment_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id            TEXT PRIMARY KEY,
    order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id    TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name  TEXT NOT NULL,
    variant_name  TEXT,
    sku           TEXT NOT NULL,
    quantity      INTEGER NOT NULL,
    unit_price    REAL NOT NULL,
    line_total    REAL NOT NULL,
    image_url     TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id          TEXT PRIMARY KEY,
    product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0,
    is_approved INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_product  ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user     ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribers (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    source      TEXT NOT NULL DEFAULT 'website',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    subject     TEXT,
    message     TEXT NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ANALYTICS EVENTS (backup; primary = Analytics Engine)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id          TEXT PRIMARY KEY,
    event_type  TEXT NOT NULL,
    event_data  TEXT NOT NULL DEFAULT '{}',   -- JSON
    page_url    TEXT,
    session_id  TEXT,
    user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
    ip_hash     TEXT,
    referrer    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_type       ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_session    ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created    ON analytics_events(created_at);

-- ============================================================
-- DAILY METRICS (populated by cron worker)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    date            TEXT NOT NULL,
    metric_name     TEXT NOT NULL,
    dimension_key   TEXT NOT NULL DEFAULT 'total',
    dimension_value TEXT NOT NULL DEFAULT 'all',
    value           REAL NOT NULL,
    PRIMARY KEY (date, metric_name, dimension_key, dimension_value)
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);

-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id          TEXT PRIMARY KEY,
    admin_id    TEXT NOT NULL REFERENCES users(id),
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   TEXT,
    details     TEXT,   -- JSON
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin   ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);
