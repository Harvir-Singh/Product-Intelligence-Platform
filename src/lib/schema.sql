-- ==============================================================================
-- STRATEGY LEDGER CLOUDFLARE D1 DATABASE SCHEMA
-- ==============================================================================

-- 1. Create Companies Node Table
CREATE TABLE IF NOT EXISTS companies (
  name TEXT NOT NULL,
  slug TEXT PRIMARY KEY,
  logo_url TEXT,
  description TEXT,
  current_product_type TEXT
);

-- 2. Create Chronological Product Strategy Events Ledger
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  product_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  date TEXT NOT NULL,
  summary TEXT NOT NULL,
  growth_strategy TEXT NOT NULL,
  monetization_strategy TEXT NOT NULL,
  product_strategy TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  tags TEXT NOT NULL,         -- JSON array string containing string tags
  source_url TEXT NOT NULL,
  confidence_score INTEGER,  -- Int 0-100 rating
  embedding TEXT             -- JSON float array string representing 1536-dim vector
);

-- 3. Create Indexes for High-Speed Taxonomy Query Filtering
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_product_type ON events(product_type);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
