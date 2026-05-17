-- OceanFresh Sovereign Fleet Registry Schema
-- Execute this in your SQL Database (e.g., via phpMyAdmin or MySQL CLI)

CREATE TABLE IF NOT EXISTS `fleet_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL UNIQUE,
  `agent_id` VARCHAR(50) NOT NULL,
  `agent_name` VARCHAR(100),
  `current_lat` DECIMAL(10, 8) NOT NULL,
  `current_lng` DECIMAL(11, 8) NOT NULL,
  `current_temp` DECIMAL(4, 1) DEFAULT -20.0,
  `estimated_arrival` VARCHAR(50),
  `status` ENUM('ASSIGNED', 'IN_TRANSIT', 'NEAR_DESTINATION', 'DELIVERED') DEFAULT 'ASSIGNED',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`order_id`),
  INDEX (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fleet_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `location_name` VARCHAR(255),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
