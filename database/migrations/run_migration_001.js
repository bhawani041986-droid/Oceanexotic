const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const sql = postgres({
  host: 'db.kyqmhibffbwoqlpdplfu.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'Sankar@1986#04',
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30
});

async function checkExisting() {
  const cols = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND table_schema = 'public'
    ORDER BY column_name
  `;
  console.log('ORDERS columns:', cols.map(c => c.column_name).join(', '));

  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log('ALL TABLES:', tables.map(t => t.table_name).join(', '));
}

async function runSection(label, sqlString) {
  try {
    await sql.unsafe(sqlString);
    console.log('✅', label);
  } catch(e) {
    console.log('⚠️ ', label, '-', e.message.substring(0, 200));
  }
}

async function main() {
  try {
    console.log('=== CHECKING CURRENT STATE ===');
    await checkExisting();
    console.log('');
    console.log('=== RUNNING MIGRATION 001 ===');

    // SECTION 1: orders table
    await runSection('orders: delivery_slot', `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(50) DEFAULT 'TODAY_PM'`);
    await runSection('orders: payment_status', `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING'`);
    await runSection('orders: payment_txn_id', `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_txn_id VARCHAR(255)`);
    await runSection('orders: payment_method_detail', `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_detail VARCHAR(100)`);
    await runSection('orders: idx_delivery_slot', `CREATE INDEX IF NOT EXISTS idx_orders_delivery_slot ON orders(delivery_slot)`);
    await runSection('orders: idx_payment_status', `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`);

    // SECTION 2: products table
    await runSection('products: net_weight_note', `ALTER TABLE products ADD COLUMN IF NOT EXISTS net_weight_note VARCHAR(255)`);
    await runSection('products: origin', `ALTER TABLE products ADD COLUMN IF NOT EXISTS origin VARCHAR(100) DEFAULT 'Local Andaman Catch'`);
    await runSection('products: storage_instructions', `ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_instructions TEXT`);
    await runSection('products: cooking_methods', `ALTER TABLE products ADD COLUMN IF NOT EXISTS cooking_methods TEXT`);
    await runSection('products: whole_weight_note', `ALTER TABLE products ADD COLUMN IF NOT EXISTS whole_weight_note VARCHAR(255)`);

    // SECTION 3: users table
    await runSection('users: loyalty_tier type', `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_tier_enum') THEN
          CREATE TYPE loyalty_tier_enum AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
        END IF;
      END $$
    `);
    await runSection('users: loyalty_tier col', `ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier loyalty_tier_enum DEFAULT NULL`);
    await runSection('users: total_spend', `ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spend DECIMAL(15,2) DEFAULT 0.00`);
    await runSection('users: wallet_balance', `ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
    await runSection('users: referral_code', `ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20)`);
    await runSection('users: referred_by', `ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20)`);
    await runSection('users: favourite_seafood', `ALTER TABLE users ADD COLUMN IF NOT EXISTS favourite_seafood JSONB DEFAULT '[]'::JSONB`);
    await runSection('users: preferred_slot', `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_slot VARCHAR(50) DEFAULT NULL`);
    await runSection('users: last_order_date', `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMPTZ DEFAULT NULL`);
    await runSection('users: order_count', `ALTER TABLE users ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0`);
    await runSection('users: avg_order_value', `ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_order_value DECIMAL(10,2) DEFAULT 0.00`);
    await runSection('users: referral_code unique', `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_referral_code_unique') THEN
          ALTER TABLE users ADD CONSTRAINT users_referral_code_unique UNIQUE (referral_code);
        END IF;
      END $$
    `);
    await runSection('users: idx_referral_code', `CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)`);
    await runSection('users: idx_loyalty_tier', `CREATE INDEX IF NOT EXISTS idx_users_loyalty_tier ON users(loyalty_tier)`);

    // SECTION 4: operational_costs table
    await runSection('CREATE operational_costs', `
      CREATE TABLE IF NOT EXISTS operational_costs (
        id              SERIAL PRIMARY KEY,
        cost_date       DATE NOT NULL,
        fish_purchase   DECIMAL(10,2) DEFAULT 0.00,
        packaging_cost  DECIMAL(10,2) DEFAULT 0.00,
        ice_cost        DECIMAL(10,2) DEFAULT 0.00,
        fuel_cost       DECIMAL(10,2) DEFAULT 0.00,
        other_cost      DECIMAL(10,2) DEFAULT 0.00,
        notes           TEXT,
        created_by      VARCHAR(50),
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_cost_date UNIQUE (cost_date)
      )
    `);
    await runSection('operational_costs: index', `CREATE INDEX IF NOT EXISTS idx_costs_date ON operational_costs(cost_date DESC)`);

    // SECTION 5: delivery_slots_config table
    await runSection('CREATE delivery_slots_config', `
      CREATE TABLE IF NOT EXISTS delivery_slots_config (
        id           SERIAL PRIMARY KEY,
        slot_key     VARCHAR(50) NOT NULL UNIQUE,
        slot_label   VARCHAR(100) NOT NULL,
        slot_time    VARCHAR(100) NOT NULL,
        is_active    BOOLEAN DEFAULT TRUE,
        max_orders   INTEGER DEFAULT 50,
        cutoff_time  TIME NOT NULL,
        sort_order   INTEGER DEFAULT 0,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await runSection('delivery_slots: seed TODAY_AM', `
      INSERT INTO delivery_slots_config (slot_key, slot_label, slot_time, is_active, max_orders, cutoff_time, sort_order)
      VALUES ('TODAY_AM', 'Today Morning', '10:00 AM - 12:00 PM', TRUE, 30, '09:00', 1)
      ON CONFLICT (slot_key) DO NOTHING
    `);
    await runSection('delivery_slots: seed TODAY_PM', `
      INSERT INTO delivery_slots_config (slot_key, slot_label, slot_time, is_active, max_orders, cutoff_time, sort_order)
      VALUES ('TODAY_PM', 'Today Evening', '4:00 PM - 7:00 PM', TRUE, 30, '14:00', 2)
      ON CONFLICT (slot_key) DO NOTHING
    `);
    await runSection('delivery_slots: seed TOMORROW', `
      INSERT INTO delivery_slots_config (slot_key, slot_label, slot_time, is_active, max_orders, cutoff_time, sort_order)
      VALUES ('TOMORROW', 'Tomorrow', 'Next day delivery', TRUE, 50, '21:00', 3)
      ON CONFLICT (slot_key) DO NOTHING
    `);

    // SECTION 6: marketplace_settings hub GPS
    const hubSettings = [
      ['hub_name', 'Dollygunj, Shiv Colony, Sri Vijayapuram, Port Blair'],
      ['hub_lat', '11.63501701727013'],
      ['hub_lng', '92.70794213208694'],
      ['service_radius_km', '8'],
      ['delivery_available_message', 'Delivery available in your area!'],
      ['delivery_unavailable_message', 'Coming soon to your area. Register for updates.'],
      ['prepaid_only', 'true'],
      ['slot_booking_enabled', 'true'],
      ['cod_enabled', 'false']
    ];
    for (const [key, value] of hubSettings) {
      await runSection(`marketplace_settings: ${key}`, `
        INSERT INTO marketplace_settings (setting_key, setting_value)
        VALUES ('${key}', '${value.replace(/'/g, "''")}')
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
      `);
    }

    // SECTION 7: referral_transactions table
    await runSection('CREATE referral_transactions', `
      CREATE TABLE IF NOT EXISTS referral_transactions (
        id              SERIAL PRIMARY KEY,
        referrer_id     VARCHAR(50) NOT NULL,
        referee_id      VARCHAR(50) NOT NULL,
        order_id        INTEGER DEFAULT NULL,
        referrer_credit DECIMAL(10,2) DEFAULT 100.00,
        referee_credit  DECIMAL(10,2) DEFAULT 100.00,
        status          VARCHAR(30) DEFAULT 'PENDING',
        credited_at     TIMESTAMPTZ DEFAULT NULL,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await runSection('referral: idx', `CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_transactions(referrer_id)`);

    // SECTION 8: wallet_transactions table
    await runSection('CREATE wallet_transactions', `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id            SERIAL PRIMARY KEY,
        user_id       VARCHAR(50) NOT NULL,
        type          VARCHAR(30) NOT NULL,
        amount        DECIMAL(10,2) NOT NULL,
        balance_after DECIMAL(10,2) NOT NULL,
        description   TEXT,
        order_id      INTEGER DEFAULT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await runSection('wallet: idx_user', `CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id)`);

    // SECTION 9: loyalty_tier_config table
    await runSection('CREATE loyalty_tier_config', `
      CREATE TABLE IF NOT EXISTS loyalty_tier_config (
        id           SERIAL PRIMARY KEY,
        tier_key     VARCHAR(20) NOT NULL UNIQUE,
        tier_label   VARCHAR(50) NOT NULL,
        min_spend    DECIMAL(10,2) NOT NULL,
        cashback_pct DECIMAL(5,2) DEFAULT 0.00,
        perks        TEXT,
        icon_emoji   VARCHAR(10) DEFAULT '🏅',
        sort_order   INTEGER DEFAULT 0,
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await runSection('loyalty: seed BRONZE', `INSERT INTO loyalty_tier_config (tier_key, tier_label, min_spend, cashback_pct, perks, icon_emoji, sort_order) VALUES ('BRONZE','Bronze',500.00,2.00,'Early access to fresh catch alerts','🥉',1) ON CONFLICT (tier_key) DO NOTHING`);
    await runSection('loyalty: seed SILVER', `INSERT INTO loyalty_tier_config (tier_key, tier_label, min_spend, cashback_pct, perks, icon_emoji, sort_order) VALUES ('SILVER','Silver',2000.00,4.00,'4% cashback + priority delivery slot','🥈',2) ON CONFLICT (tier_key) DO NOTHING`);
    await runSection('loyalty: seed GOLD', `INSERT INTO loyalty_tier_config (tier_key, tier_label, min_spend, cashback_pct, perks, icon_emoji, sort_order) VALUES ('GOLD','Gold',5000.00,6.00,'6% cashback + free delivery on every order','🥇',3) ON CONFLICT (tier_key) DO NOTHING`);
    await runSection('loyalty: seed PLATINUM', `INSERT INTO loyalty_tier_config (tier_key, tier_label, min_spend, cashback_pct, perks, icon_emoji, sort_order) VALUES ('PLATINUM','Platinum',10000.00,10.00,'10% cashback + dedicated delivery agent','💎',4) ON CONFLICT (tier_key) DO NOTHING`);

    // SECTION 10: freshness_tracker_logs table
    await runSection('CREATE freshness_tracker_logs', `
      CREATE TABLE IF NOT EXISTS freshness_tracker_logs (
        id              SERIAL PRIMARY KEY,
        order_id        INTEGER NOT NULL,
        catch_id        VARCHAR(50) DEFAULT NULL,
        catch_datetime  TIMESTAMPTZ DEFAULT NULL,
        cleaned_at      TIMESTAMPTZ DEFAULT NULL,
        packed_at       TIMESTAMPTZ DEFAULT NULL,
        dispatched_at   TIMESTAMPTZ DEFAULT NULL,
        delivered_at    TIMESTAMPTZ DEFAULT NULL,
        notes           TEXT,
        created_by      VARCHAR(50),
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await runSection('freshness: unique idx', `CREATE UNIQUE INDEX IF NOT EXISTS idx_freshness_order ON freshness_tracker_logs(order_id)`);

    // SECTION 11: updated_at trigger
    await runSection('CREATE trigger function', `
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await runSection('trigger: operational_costs', `
      DROP TRIGGER IF EXISTS trg_operational_costs_updated ON operational_costs;
      CREATE TRIGGER trg_operational_costs_updated BEFORE UPDATE ON operational_costs FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
    `);
    await runSection('trigger: delivery_slots_config', `
      DROP TRIGGER IF EXISTS trg_slots_config_updated ON delivery_slots_config;
      CREATE TRIGGER trg_slots_config_updated BEFORE UPDATE ON delivery_slots_config FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
    `);
    await runSection('trigger: freshness_tracker_logs', `
      DROP TRIGGER IF EXISTS trg_freshness_updated ON freshness_tracker_logs;
      CREATE TRIGGER trg_freshness_updated BEFORE UPDATE ON freshness_tracker_logs FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
    `);

    // FINAL VERIFICATION
    console.log('');
    console.log('=== VERIFICATION ===');
    const orderCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders' AND table_schema = 'public' 
      AND column_name IN ('delivery_slot','payment_status','payment_txn_id')
    `;
    console.log('orders new cols:', orderCols.map(c => c.column_name).join(', '));

    const productCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public' 
      AND column_name IN ('net_weight_note','origin','storage_instructions','cooking_methods')
    `;
    console.log('products new cols:', productCols.map(c => c.column_name).join(', '));

    const userCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public' 
      AND column_name IN ('loyalty_tier','wallet_balance','referral_code','total_spend')
    `;
    console.log('users new cols:', userCols.map(c => c.column_name).join(', '));

    const newTables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('operational_costs','delivery_slots_config','referral_transactions','wallet_transactions','loyalty_tier_config','freshness_tracker_logs')
      ORDER BY table_name
    `;
    console.log('new tables:', newTables.map(t => t.table_name).join(', '));

    const slots = await sql`SELECT slot_key, slot_time, is_active FROM delivery_slots_config ORDER BY sort_order`;
    console.log('delivery slots:');
    slots.forEach(s => console.log('  -', s.slot_key, '|', s.slot_time, '| active:', s.is_active));

    const tiers = await sql`SELECT tier_key, min_spend, cashback_pct FROM loyalty_tier_config ORDER BY sort_order`;
    console.log('loyalty tiers:');
    tiers.forEach(t => console.log('  -', t.tier_key, '| min spend: ₹' + t.min_spend, '| cashback:', t.cashback_pct + '%'));

    const hubCols = await sql`
      SELECT setting_key, setting_value FROM marketplace_settings 
      WHERE setting_key IN ('hub_lat','hub_lng','service_radius_km','prepaid_only','cod_enabled')
      ORDER BY setting_key
    `;
    console.log('hub settings:');
    hubCols.forEach(h => console.log('  -', h.setting_key + ':', h.setting_value));

    console.log('');
    console.log('🎉 MIGRATION 001 COMPLETE');

  } catch(e) {
    console.error('FATAL:', e.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
