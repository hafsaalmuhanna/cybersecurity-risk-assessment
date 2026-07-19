-- Codera multi-tenant schema (SQLite)
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Platform owner accounts (Codera company staff)
CREATE TABLE IF NOT EXISTS platform_admins (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subscription plans offered to merchants
CREATE TABLE IF NOT EXISTS plans (
  id            TEXT PRIMARY KEY,           -- e.g. 'starter'
  name          TEXT NOT NULL,
  price_cents   INTEGER NOT NULL,           -- monthly price in minor units
  currency      TEXT NOT NULL DEFAULT 'SAR',
  quota_month   INTEGER NOT NULL,           -- AI generations per month
  max_products  INTEGER NOT NULL,
  max_models    INTEGER NOT NULL,
  custom_domain INTEGER NOT NULL DEFAULT 0, -- 1 = allowed
  features_json TEXT NOT NULL DEFAULT '[]',
  sort          INTEGER NOT NULL DEFAULT 0
);

-- Each merchant store = one tenant (white-label)
CREATE TABLE IF NOT EXISTS tenants (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,       -- subdomain: {slug}.codera.app
  custom_domain TEXT UNIQUE,                -- e.g. shop.client.com
  plan_id       TEXT REFERENCES plans(id),
  status        TEXT NOT NULL DEFAULT 'trialing', -- trialing|active|past_due|canceled
  brand_json    TEXT NOT NULL DEFAULT '{}', -- {logo,color,name,currency,lang,rtl}
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Merchant users belonging to a tenant
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'owner',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, email)
);

-- Auth sessions (merchant dashboard + platform admin)
CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,                -- 'user' | 'admin'
  subject_id  INTEGER NOT NULL,
  tenant_id   INTEGER,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subscriptions (billing state per tenant)
CREATE TABLE IF NOT EXISTS subscriptions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id      INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id        TEXT NOT NULL REFERENCES plans(id),
  status         TEXT NOT NULL DEFAULT 'trialing',
  provider       TEXT,                       -- 'upayment'|'manual'
  provider_ref   TEXT,
  period_start   TEXT,
  period_end     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Global catalog of house models (Codera-owned)
CREATE TABLE IF NOT EXISTS house_models (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  ethnicity   TEXT,                          -- خليجي، جنوب آسيوي، ...
  skin_tone   TEXT,
  hair        TEXT,
  hijab       INTEGER NOT NULL DEFAULT 0,     -- 1 = محجّبة
  poses_json  TEXT NOT NULL DEFAULT '["بورتريه"]',
  image_url   TEXT,
  active      INTEGER NOT NULL DEFAULT 1
);

-- Which house models each tenant enabled for its storefront
CREATE TABLE IF NOT EXISTS tenant_models (
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id    INTEGER NOT NULL REFERENCES house_models(id) ON DELETE CASCADE,
  enabled     INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, model_id)
);

-- Products (imported from Shopify or created manually)
CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id     INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT,                        -- Shopify product id/handle
  title         TEXT NOT NULL,
  description   TEXT,
  price_cents   INTEGER NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'SAR',
  category      TEXT,                        -- top|bottom|dress|abaya|accessory
  images_json   TEXT NOT NULL DEFAULT '[]',
  garment_url   TEXT,                        -- primary flat-lay garment image for try-on
  source        TEXT NOT NULL DEFAULT 'manual',
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);

-- Virtual try-on generation jobs
CREATE TABLE IF NOT EXISTS tryon_jobs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id      INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  model_id       INTEGER REFERENCES house_models(id),
  shopper_photo  TEXT,                        -- if customer uploaded their own photo
  hijab          INTEGER NOT NULL DEFAULT 0,
  pose           TEXT,
  status         TEXT NOT NULL DEFAULT 'queued', -- queued|processing|done|failed
  result_url     TEXT,
  provider       TEXT,
  error          TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON tryon_jobs(tenant_id);

-- Usage log for quota/billing
CREATE TABLE IF NOT EXISTS usage_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id   INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                 -- 'tryon'
  period      TEXT NOT NULL,                 -- 'YYYY-MM'
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_usage_tenant_period ON usage_events(tenant_id, period);

-- Shopify (or CSV) import jobs
CREATE TABLE IF NOT EXISTS import_jobs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id    INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source       TEXT NOT NULL,                -- 'shopify_api'|'shopify_csv'
  status       TEXT NOT NULL DEFAULT 'pending',
  total        INTEGER NOT NULL DEFAULT 0,
  imported     INTEGER NOT NULL DEFAULT 0,
  log          TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Shopify store connections per tenant
CREATE TABLE IF NOT EXISTS shopify_connections (
  tenant_id    INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  shop_domain  TEXT NOT NULL,                -- xyz.myshopify.com
  access_token TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
