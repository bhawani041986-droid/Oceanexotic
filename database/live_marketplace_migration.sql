-- ============================================================
-- OceanExotic Live Harbor Marketplace Migration
-- Run once against the oceanexotic database
-- ============================================================

-- 1. Add live inventory columns to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS freshness_timestamp DATETIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS catch_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS harbor_node VARCHAR(100) DEFAULT 'Port Blair Harbor',
  ADD COLUMN IF NOT EXISTS is_live_inventory TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg';

-- 2. Today's Catch table — core of the live marketplace
CREATE TABLE IF NOT EXISTS todays_catch (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  seller_id VARCHAR(50) NOT NULL,
  catch_date DATE NOT NULL,
  harbor_node VARCHAR(100) NOT NULL DEFAULT 'Port Blair Harbor',
  quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_kg DECIMAL(10,2) NOT NULL,
  freshness_timestamp DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  catch_image_url TEXT DEFAULT NULL,
  batch_label VARCHAR(50) DEFAULT 'TODAY',  -- MORNING, AFTERNOON, EVENING
  status VARCHAR(30) DEFAULT 'FRESH',       -- FRESH, SELLING_FAST, SOLD_OUT, ARCHIVED
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_catch_date (catch_date),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Cut options with per-cut pricing
CREATE TABLE IF NOT EXISTS product_cut_options (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  cut_type VARCHAR(50) NOT NULL,
  -- Cut types: WHOLE, CURRY_CUT, STEAK_CUT, FILLET, CLEANED, UNCLEANED, HEAD_ON, HEAD_OFF, SKIN_ON, SKIN_OFF
  price_modifier_percent DECIMAL(5,2) DEFAULT 0,  -- e.g. 10.00 = 10% extra for fillet
  price_flat_add DECIMAL(10,2) DEFAULT 0,          -- fixed ₹ add-on per kg
  is_available TINYINT(1) DEFAULT 1,
  stock_kg DECIMAL(10,2) DEFAULT NULL,             -- NULL = inherits from todays_catch
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  UNIQUE KEY uniq_product_cut (product_id, cut_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Inventory logs for audit trail
CREATE TABLE IF NOT EXISTS inventory_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  catch_id VARCHAR(50) DEFAULT NULL,
  action VARCHAR(50) NOT NULL,  -- UPLOAD, SALE, EXPIRE, ARCHIVE, ADJUST
  quantity_change DECIMAL(10,2) DEFAULT 0,
  quantity_after DECIMAL(10,2) DEFAULT 0,
  actor_id VARCHAR(50) DEFAULT NULL,
  actor_type VARCHAR(20) DEFAULT 'SYSTEM', -- SYSTEM, SELLER, ADMIN
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_log (product_id),
  INDEX idx_catch_log (catch_id),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Seed cut options for all existing products
-- Base cut options (apply to all fish products)
INSERT IGNORE INTO product_cut_options (id, product_id, cut_type, price_modifier_percent, price_flat_add, is_available, sort_order) VALUES
-- Surmai
('CUT-SM-01','surmai-seer-fish','WHOLE',0,0,1,1),
('CUT-SM-02','surmai-seer-fish','CURRY_CUT',0,30,1,2),
('CUT-SM-03','surmai-seer-fish','STEAK_CUT',5,0,1,3),
('CUT-SM-04','surmai-seer-fish','FILLET',15,50,1,4),
('CUT-SM-05','surmai-seer-fish','CLEANED',0,20,1,5),
('CUT-SM-06','surmai-seer-fish','UNCLEANED',-5,0,1,6),
('CUT-SM-07','surmai-seer-fish','HEAD_ON',0,0,1,7),
('CUT-SM-08','surmai-seer-fish','HEAD_OFF',0,10,1,8),
-- Bangda
('CUT-BG-01','bangda-mackerel','WHOLE',0,0,1,1),
('CUT-BG-02','bangda-mackerel','CURRY_CUT',0,20,1,2),
('CUT-BG-03','bangda-mackerel','CLEANED',0,15,1,3),
('CUT-BG-04','bangda-mackerel','UNCLEANED',-5,0,1,4),
('CUT-BG-05','bangda-mackerel','HEAD_ON',0,0,1,5),
('CUT-BG-06','bangda-mackerel','HEAD_OFF',0,8,1,6),
-- Paplet
('CUT-PP-01','paplet-pomfret','WHOLE',0,0,1,1),
('CUT-PP-02','paplet-pomfret','CURRY_CUT',0,40,1,2),
('CUT-PP-03','paplet-pomfret','FILLET',20,60,1,3),
('CUT-PP-04','paplet-pomfret','CLEANED',0,30,1,4),
-- Tuna
('CUT-TN-01','yellowfin-tuna','WHOLE',0,0,1,1),
('CUT-TN-02','yellowfin-tuna','STEAK_CUT',5,0,1,2),
('CUT-TN-03','yellowfin-tuna','FILLET',20,60,1,3),
('CUT-TN-04','yellowfin-tuna','CLEANED',0,20,1,4),
('CUT-TN-05','yellowfin-tuna','SKIN_ON',0,0,1,5),
('CUT-TN-06','yellowfin-tuna','SKIN_OFF',5,10,1,6),
-- Red Snapper
('CUT-RS-01','red-snapper','WHOLE',0,0,1,1),
('CUT-RS-02','red-snapper','CURRY_CUT',0,30,1,2),
('CUT-RS-03','red-snapper','FILLET',15,50,1,3),
('CUT-RS-04','red-snapper','CLEANED',0,20,1,4),
-- Prawns
('CUT-PR-01','fresh-prawns','WHOLE',0,0,1,1),
('CUT-PR-02','fresh-prawns','CLEANED',0,50,1,2),
('CUT-PR-03','fresh-prawns','HEAD_ON',0,0,1,3),
('CUT-PR-04','fresh-prawns','HEAD_OFF',0,30,1,4),
-- Tiger Prawns
('CUT-TP-01','tiger-prawns','WHOLE',0,0,1,1),
('CUT-TP-02','tiger-prawns','CLEANED',0,80,1,2),
('CUT-TP-03','tiger-prawns','HEAD_ON',0,0,1,3),
('CUT-TP-04','tiger-prawns','HEAD_OFF',0,50,1,4),
-- Squid
('CUT-SQ-01','fresh-squid','WHOLE',0,0,1,1),
('CUT-SQ-02','fresh-squid','CLEANED',0,60,1,2),
('CUT-SQ-03','fresh-squid','CURRY_CUT',0,40,1,3);

-- 6. Seed today's catch from existing products (today's date)
INSERT IGNORE INTO todays_catch (id, product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status) VALUES
('TC-001', 'surmai-seer-fish', 'SEL-LOCAL', CURDATE(), 'Aberdeen Bazaar Jetty', 30, 30, 1600, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'FRESH'),
('TC-002', 'bangda-mackerel', 'SEL-LOCAL', CURDATE(), 'Phoenix Bay Harbor', 50, 42, 320, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'FRESH'),
('TC-003', 'paplet-pomfret', 'SEL-LOCAL', CURDATE(), 'Haddo Wharf', 15, 8, 1800, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'SELLING_FAST'),
('TC-004', 'yellowfin-tuna', 'SEL-LOCAL', CURDATE(), 'Port Blair Harbor', 40, 40, 650, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'AFTERNOON', 'FRESH'),
('TC-005', 'red-snapper', 'SEL-LOCAL', CURDATE(), 'Junglighat Pier', 20, 20, 900, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'FRESH'),
('TC-006', 'fresh-prawns', 'SEL-LOCAL', CURDATE(), 'Aberdeen Bazaar Jetty', 25, 18, 950, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'SELLING_FAST'),
('TC-007', 'tiger-prawns', 'SEL-LOCAL', CURDATE(), 'Haddo Wharf', 10, 6, 2200, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'SELLING_FAST'),
('TC-008', 'fresh-squid', 'SEL-LOCAL', CURDATE(), 'Phoenix Bay Harbor', 20, 20, 650, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'AFTERNOON', 'FRESH'),
('TC-009', 'mud-crab', 'SEL-LOCAL', CURDATE(), 'Garacharma Dock', 8, 3, 1200, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'SELLING_FAST'),
('TC-010', 'fresh-sardine', 'SEL-LOCAL', CURDATE(), 'Dollygunj Jetty', 60, 55, 180, NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'MORNING', 'FRESH');
