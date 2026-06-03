-- ============================================================
-- OceanFresh Order Pipeline Extension
-- Adds delivery_area for area-wise and seller-wise analytics
-- Run once against the ocean_fresh / oceanexotic database
-- ============================================================

-- 1. Add delivery_area column to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_area VARCHAR(100) DEFAULT 'Port Blair';

-- 2. Add index for fast GROUP BY queries
ALTER TABLE orders
  ADD INDEX IF NOT EXISTS idx_delivery_area (delivery_area);

-- 3. Backfill from customer_address (for older schema)
UPDATE orders SET delivery_area =
  CASE
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%havelock%'
      OR LOWER(COALESCE(customer_address, '')) LIKE '%swaraj dweep%'   THEN 'Havelock Island'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%neil island%'
      OR LOWER(COALESCE(customer_address, '')) LIKE '%shaheed dweep%'  THEN 'Neil Island'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%bambooflat%'
      OR LOWER(COALESCE(customer_address, '')) LIKE '%bamboo flat%'    THEN 'Bambooflat'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%garacharma%'     THEN 'Garacharma'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%diglipur%'       THEN 'Diglipur'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%rangat%'         THEN 'Rangat'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%mayabundar%'     THEN 'Mayabundar'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%baratang%'       THEN 'Baratang'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%haddo%'          THEN 'Haddo'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%phoenix bay%'    THEN 'Phoenix Bay'
    WHEN LOWER(COALESCE(customer_address, '')) LIKE '%aberdeen%'       THEN 'Aberdeen Bazaar'
    ELSE 'Port Blair'
  END
WHERE customer_address IS NOT NULL AND customer_address != '';

-- 4. Backfill from delivery_address (for live marketplace schema)
UPDATE orders SET delivery_area =
  CASE
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%havelock%'
      OR LOWER(COALESCE(delivery_address, '')) LIKE '%swaraj dweep%'   THEN 'Havelock Island'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%neil island%'
      OR LOWER(COALESCE(delivery_address, '')) LIKE '%shaheed dweep%'  THEN 'Neil Island'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%bambooflat%'
      OR LOWER(COALESCE(delivery_address, '')) LIKE '%bamboo flat%'    THEN 'Bambooflat'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%garacharma%'     THEN 'Garacharma'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%diglipur%'       THEN 'Diglipur'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%rangat%'         THEN 'Rangat'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%mayabundar%'     THEN 'Mayabundar'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%baratang%'       THEN 'Baratang'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%haddo%'          THEN 'Haddo'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%phoenix bay%'    THEN 'Phoenix Bay'
    WHEN LOWER(COALESCE(delivery_address, '')) LIKE '%aberdeen%'       THEN 'Aberdeen Bazaar'
    ELSE delivery_area
  END
WHERE delivery_address IS NOT NULL AND delivery_address != '';
