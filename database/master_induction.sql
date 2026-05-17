-- --- OCEANFRESH SOVEREIGN SPINE MASTER INDUCTION ---
-- Anchor Port: 3307 | Database: ocean_fresh

-- 1. Citizen Identities
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Default 'password'
    avatar_url TEXT,
    grade VARCHAR(100) DEFAULT 'Maritime Citizen',
    loyalty_points INT DEFAULT 0,
    role ENUM('customer', 'seller', 'admin', 'agent') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Address Vault
CREATE TABLE IF NOT EXISTS user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(100),
    address TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Payment Protocols
CREATE TABLE IF NOT EXISTS user_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    card_holder VARCHAR(255),
    card_type VARCHAR(50),
    last4 VARCHAR(4),
    expiry VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Registry (Merchant Inventory)
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

-- 5. Order Registry (Platform Commissions)
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

-- 6. Fleet Telemetry
CREATE TABLE IF NOT EXISTS `fleet_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL UNIQUE,
  `agent_id` INT NOT NULL,
  `agent_name` VARCHAR(100),
  `current_lat` DECIMAL(10, 8) NOT NULL,
  `current_lng` DECIMAL(11, 8) NOT NULL,
  `current_temp` DECIMAL(4, 1) DEFAULT -20.0,
  `estimated_arrival` VARCHAR(50),
  `status` ENUM('ASSIGNED', 'IN_TRANSIT', 'NEAR_DESTINATION', 'DELIVERED') DEFAULT 'ASSIGNED',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Fleet Logs
CREATE TABLE IF NOT EXISTS `fleet_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `location_name` VARCHAR(255),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Agent Environmental Settings (Tactical Moods)
CREATE TABLE IF NOT EXISTS `agent_settings` (
  `agent_id` INT PRIMARY KEY,
  `current_mood` ENUM('SENTINEL', 'MIDNIGHT', 'DAYLIGHT') DEFAULT 'SENTINEL',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --- BASELINE DATA INDUCTION ---
INSERT IGNORE INTO users (id, name, email, role, grade, loyalty_points) 
VALUES (1, 'Admiral Sovereign', 'admiral@oceanfresh.hub', 'customer', 'Gold Citizen', 2450);

INSERT IGNORE INTO users (id, name, email, role) 
VALUES (7, 'Agent BHAWANI', 'bhawani@oceanfresh.agent', 'agent');
