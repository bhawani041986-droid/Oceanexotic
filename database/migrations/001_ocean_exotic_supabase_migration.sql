-- ================================================
-- OCEAN EXOTIC — SUPABASE MIGRATION v001
-- 100% PostgreSQL ✅  Safe to re-run ✅
--
-- PASTE THIS IN FULL into:
-- supabase.com → SQL Editor → New Query → RUN
-- ================================================


-- ════════════════════════════════════════════════
-- 1.  ORDERS  — add missing columns
-- ════════════════════════════════════════════════

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_slot          TEXT    DEFAULT 'TODAY_PM',
  ADD COLUMN IF NOT EXISTS payment_status         TEXT    DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS payment_txn_id         TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_detail  TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_slot   ON orders (delivery_slot);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status  ON orders (payment_status);


-- ════════════════════════════════════════════════
-- 2.  PRODUCTS  — add missing columns
-- ════════════════════════════════════════════════

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS net_weight_note         TEXT,
  ADD COLUMN IF NOT EXISTS origin                  TEXT    DEFAULT 'Local Andaman Catch',
  ADD COLUMN IF NOT EXISTS storage_instructions    TEXT,
  ADD COLUMN IF NOT EXISTS cooking_methods         TEXT,
  ADD COLUMN IF NOT EXISTS whole_weight_note       TEXT,
  ADD COLUMN IF NOT EXISTS unit                    TEXT    DEFAULT 'KG',
  ADD COLUMN IF NOT EXISTS is_live_inventory       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS harbor_node             TEXT    DEFAULT 'Phoenix Bay Harbor',
  ADD COLUMN IF NOT EXISTS catch_date              DATE,
  ADD COLUMN IF NOT EXISTS freshness_timestamp     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nutrition               TEXT,
  ADD COLUMN IF NOT EXISTS quality_rank            TEXT    DEFAULT 'VERIFIED',
  ADD COLUMN IF NOT EXISTS is_featured             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS video_url               TEXT;


-- ════════════════════════════════════════════════
-- 3.  USERS  — add loyalty / wallet / referral
-- ════════════════════════════════════════════════

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS loyalty_tier       TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS total_spend        NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wallet_balance     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code      TEXT,
  ADD COLUMN IF NOT EXISTS referred_by        TEXT,
  ADD COLUMN IF NOT EXISTS favourite_seafood  JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS preferred_slot     TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_order_date    TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS order_count        INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_order_value    NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_referral_code  ON users (referral_code);
CREATE INDEX IF NOT EXISTS idx_users_loyalty_tier   ON users (loyalty_tier);


-- ════════════════════════════════════════════════
-- 4.  NEW TABLE: operational_costs
--     Admin enters daily fish / ice / fuel costs
--     Powers the Profit Dashboard
-- ════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS operational_costs (
  id              SERIAL PRIMARY KEY,
  cost_date       DATE        NOT NULL,
  fish_purchase   NUMERIC     DEFAULT 0,
  packaging_cost  NUMERIC     DEFAULT 0,
  ice_cost        NUMERIC     DEFAULT 0,
  fuel_cost       NUMERIC     DEFAULT 0,
  other_cost      NUMERIC     DEFAULT 0,
  notes           TEXT,
  created_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cost_date)
);

CREATE INDEX IF NOT EXISTS idx_costs_date ON operational_costs (cost_date DESC);


-- ════════════════════════════════════════════════
-- 5.  NEW TABLE: delivery_slots_config
--     Admin toggles slots on/off, sets capacity
-- ════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS delivery_slots_config (
  id          SERIAL PRIMARY KEY,
  slot_key    TEXT    NOT NULL UNIQUE,
  slot_label  TEXT    NOT NULL,
  slot_time   TEXT    NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  max_orders  INT     DEFAULT 50,
  cutoff_time TIME    NOT NULL,
  sort_order  INT     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO delivery_slots_config
  (slot_key, slot_label, slot_time, is_active, max_orders, cutoff_time, sort_order)
VALUES
  ('TODAY_AM', 'Today Morning', '10:00 AM – 12:00 PM', TRUE, 30, '09:00', 1),
  ('TODAY_PM', 'Today Evening', '4:00 PM – 7:00 PM',   TRUE, 30, '14:00', 2),
  ('TOMORROW', 'Tomorrow',      'Next day delivery',    TRUE, 50, '21:00', 3)
ON CONFLICT (slot_key) DO NOTHING;


-- ════════════════════════════════════════════════
-- 6.  marketplace_settings — hub GPS + flags
--     Dollygunj, Shiv Colony, Sri Vijayapuram
-- ════════════════════════════════════════════════

INSERT INTO marketplace_settings (setting_key, setting_value)
VALUES
  ('hub_name',                    'Dollygunj, Shiv Colony, Sri Vijayapuram, Port Blair'),
  ('hub_lat',                     '11.63501701727013'),
  ('hub_lng',                     '92.70794213208694'),
  ('service_radius_km',           '8'),
  ('delivery_available_message',  'Delivery available in your area!'),
  ('delivery_unavailable_message','Coming soon to your area. Register for updates.'),
  ('prepaid_only',                'true'),
  ('slot_booking_enabled',        'true'),
  ('cod_enabled',                 'false')
ON CONFLICT (setting_key)
  DO UPDATE SET setting_value = EXCLUDED.setting_value,
                updated_at    = NOW();


-- ════════════════════════════════════════════════
-- 7.  NEW TABLE: referral_transactions
-- ════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referral_transactions (
  id              SERIAL PRIMARY KEY,
  referrer_id     TEXT    NOT NULL,
  referee_id      TEXT    NOT NULL,
  order_id        INT     DEFAULT NULL,
  referrer_credit NUMERIC DEFAULT 100,
  referee_credit  NUMERIC DEFAULT 100,
  status          TEXT    DEFAULT 'PENDING',
  credited_at     TIMESTAMPTZ DEFAULT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ref_referrer ON referral_transactions (referrer_id);
CREATE INDEX IF NOT EXISTS idx_ref_referee  ON referral_transactions (referee_id);
CREATE INDEX IF NOT EXISTS idx_ref_status   ON referral_transactions (status);


-- ════════════════════════════════════════════════
-- 8.  NEW TABLE: wallet_transactions
-- ════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT    NOT NULL,
  type          TEXT    NOT NULL,
  amount        NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  description   TEXT,
  order_id      INT     DEFAULT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_type ON wallet_transactions (type);


-- ════════════════════════════════════════════════
-- 9.  NEW TABLE: loyalty_tier_config  + seed
-- ════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loyalty_tier_config (
  id           SERIAL PRIMARY KEY,
  tier_key     TEXT    NOT NULL UNIQUE,
  tier_label   TEXT    NOT NULL,
  min_spend    NUMERIC NOT NULL,
  cashback_pct NUMERIC DEFAULT 0,
  perks        TEXT,
  icon_emoji   TEXT    DEFAULT '🏅',
  sort_order   INT     DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO loyalty_tier_config
  (tier_key, tier_label, min_spend, cashback_pct, perks, icon_emoji, sort_order)
VALUES
  ('BRONZE',   'Bronze',    500,   2,  'Early access to fresh catch alerts',                '🥉', 1),
  ('SILVER',   'Silver',   2000,   4,  '4% cashback + priority delivery slot',              '🥈', 2),
  ('GOLD',     'Gold',     5000,   6,  '6% cashback + free delivery on every order',        '🥇', 3),
  ('PLATINUM', 'Platinum', 10000, 10,  '10% cashback + dedicated delivery agent + priority','💎', 4)
ON CONFLICT (tier_key) DO NOTHING;


-- ════════════════════════════════════════════════
-- 10. NEW TABLE: freshness_tracker_logs
--     Powers the Ocean Freshness Tracker feature
-- ════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS freshness_tracker_logs (
  id             SERIAL PRIMARY KEY,
  order_id       INT  NOT NULL UNIQUE,
  catch_id       TEXT DEFAULT NULL,
  catch_datetime TIMESTAMPTZ DEFAULT NULL,
  cleaned_at     TIMESTAMPTZ DEFAULT NULL,
  packed_at      TIMESTAMPTZ DEFAULT NULL,
  dispatched_at  TIMESTAMPTZ DEFAULT NULL,
  delivered_at   TIMESTAMPTZ DEFAULT NULL,
  notes          TEXT,
  created_by     TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ════════════════════════════════════════════════
-- 11. auto updated_at trigger
--     (replaces MySQL ON UPDATE CURRENT_TIMESTAMP)
-- ════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_opcosts_updated  ON operational_costs;
CREATE TRIGGER trg_opcosts_updated
  BEFORE UPDATE ON operational_costs
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_slots_updated ON delivery_slots_config;
CREATE TRIGGER trg_slots_updated
  BEFORE UPDATE ON delivery_slots_config
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_freshness_updated ON freshness_tracker_logs;
CREATE TRIGGER trg_freshness_updated
  BEFORE UPDATE ON freshness_tracker_logs
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ════════════════════════════════════════════════
-- 12. VERIFY  (results shown automatically)
-- ════════════════════════════════════════════════

SELECT '✅ orders columns' AS check,
       string_agg(column_name, ', ' ORDER BY column_name) AS added
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = 'orders'
  AND  column_name  IN ('delivery_slot','payment_status','payment_txn_id');

SELECT '✅ products columns' AS check,
       string_agg(column_name, ', ' ORDER BY column_name) AS added
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = 'products'
  AND  column_name  IN ('net_weight_note','origin','storage_instructions','cooking_methods');

SELECT '✅ users columns' AS check,
       string_agg(column_name, ', ' ORDER BY column_name) AS added
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = 'users'
  AND  column_name  IN ('loyalty_tier','wallet_balance','referral_code','total_spend');

SELECT '✅ new tables' AS check,
       string_agg(table_name, ', ' ORDER BY table_name) AS created
FROM   information_schema.tables
WHERE  table_schema = 'public'
  AND  table_name   IN (
         'operational_costs','delivery_slots_config',
         'referral_transactions','wallet_transactions',
         'loyalty_tier_config','freshness_tracker_logs');

SELECT '✅ delivery slots' AS check, slot_key, slot_time, is_active
FROM   delivery_slots_config
ORDER  BY sort_order;

SELECT '✅ loyalty tiers' AS check, tier_key, min_spend, cashback_pct
FROM   loyalty_tier_config
ORDER  BY sort_order;

SELECT '✅ hub settings' AS check, setting_key, setting_value
FROM   marketplace_settings
WHERE  setting_key IN ('hub_lat','hub_lng','service_radius_km','prepaid_only','cod_enabled')
ORDER  BY setting_key;

-- ════════════════════════════════════════════════
-- DONE ✅
-- ════════════════════════════════════════════════
