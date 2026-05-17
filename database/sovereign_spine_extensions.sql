-- OceanFresh Sovereign Spine Extensions
-- Hardening the registries for Orders, Products, and Agent Settings

-- 1. Product Registry (Merchant Inventory)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED') DEFAULT 'ACTIVE',
  `image_url` TEXT,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Order Registry (Platform Commissions)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(20),
  `customer_address` TEXT,
  `seller_name` VARCHAR(255),
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'MEDIATION') DEFAULT 'PENDING',
  `logistics_status` VARCHAR(50) DEFAULT 'OPTIMAL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Agent Environmental Settings (Tactical Moods)
CREATE TABLE IF NOT EXISTS `agent_settings` (
  `agent_id` VARCHAR(50) PRIMARY KEY,
  `current_mood` ENUM('SENTINEL', 'MIDNIGHT', 'DAYLIGHT') DEFAULT 'SENTINEL',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
