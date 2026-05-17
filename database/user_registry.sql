-- --- SOVEREIGN USER REGISTRY EXTENSIONS ---

-- Citizen Identities Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    grade VARCHAR(100) DEFAULT 'Maritime Citizen',
    loyalty_points INT DEFAULT 0,
    user_type ENUM('CUSTOMER', 'AGENT', 'SELLER', 'ADMIN') DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Address Vault Table
CREATE TABLE IF NOT EXISTS user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    type VARCHAR(100),
    address TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment Protocols Table
CREATE TABLE IF NOT EXISTS user_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    card_holder VARCHAR(255),
    card_type VARCHAR(50),
    last4 VARCHAR(4),
    expiry VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --- BASELINE IDENTITY INDUCTION ---
INSERT IGNORE INTO users (id, name, email, user_type, grade, loyalty_points) 
VALUES ('USR-001', 'Vikram Sharma', 'vikram.sharma@fleet.com', 'CUSTOMER', 'Gold Citizen', 2450);

INSERT IGNORE INTO users (id, name, email, user_type) 
VALUES ('AGENT-007', 'Agent BHAWANI', 'bhawani@oceanfresh.agent', 'AGENT');

INSERT IGNORE INTO user_addresses (user_id, type, address, is_default)
VALUES ('USR-001', 'Home Registry', '12/A, Maritime Towers, Port Blair, Andaman', TRUE);

INSERT IGNORE INTO user_payments (user_id, card_holder, card_type, last4, expiry, is_default)
VALUES ('USR-001', 'Vikram Sharma', 'VISA', '9021', '12/28', TRUE);
