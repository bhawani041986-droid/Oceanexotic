-- ============================================================
-- OceanExotic: Dynamic ETA timestamp columns for orders table
-- Run this once in Supabase SQL editor
-- ============================================================

-- Add delivery workflow timestamp columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS preparation_started_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS packed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS eta_last_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Add GPS columns to delivery_agents if not present
ALTER TABLE delivery_agents
  ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10,8) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11,8) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_location_update_at TIMESTAMPTZ DEFAULT NULL;

-- Create fleet_tracking table if not already present (it should exist from schema)
CREATE TABLE IF NOT EXISTS fleet_tracking (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE,
  agent_id VARCHAR(50) NOT NULL,
  agent_name VARCHAR(100) DEFAULT NULL,
  current_lat DECIMAL(10,8) NOT NULL DEFAULT 11.6670,
  current_lng DECIMAL(11,8) NOT NULL DEFAULT 92.7359,
  current_temp DECIMAL(4,1) DEFAULT -18.0,
  estimated_arrival TIMESTAMPTZ DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'ASSIGNED',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample fleet_tracking for existing orders (for demo/testing)
-- This will show Phoenix Bay Hub as the driver location for any existing active orders
INSERT INTO fleet_tracking (order_id, agent_id, agent_name, current_lat, current_lng, current_temp, estimated_arrival, status)
SELECT
  o.id::VARCHAR,
  'AGT-001',
  'Rajan Kumar',
  11.6670,
  92.7359,
  -18.2,
  NOW() + INTERVAL '30 minutes',
  'ASSIGNED'
FROM orders o
WHERE o.status IN ('CONFIRMED', 'PREPARING', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY')
  AND NOT EXISTS (
    SELECT 1 FROM fleet_tracking ft WHERE ft.order_id = o.id::VARCHAR
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_fleet_tracking_order_id ON fleet_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
