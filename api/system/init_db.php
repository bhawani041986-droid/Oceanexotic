<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Disable foreign key checks to allow dropping/recreating tables
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Drop all tables for a clean hard-reset
    $pdo->exec("DROP TABLE IF EXISTS order_items");
    $pdo->exec("DROP TABLE IF EXISTS orders");
    $pdo->exec("DROP TABLE IF EXISTS products");
    $pdo->exec("DROP TABLE IF EXISTS sellers");
    $pdo->exec("DROP TABLE IF EXISTS user_addresses");
    $pdo->exec("DROP TABLE IF EXISTS cms_content");
    $pdo->exec("DROP TABLE IF EXISTS marketplace_settings");

    // 1. Create Settings Table
    $pdo->exec("CREATE TABLE marketplace_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // 2. Create CMS Content Table
    $pdo->exec("CREATE TABLE cms_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'BANNER',
        status VARCHAR(50) DEFAULT 'DRAFT',
        sector VARCHAR(100) DEFAULT 'GLOBAL',
        image_url LONGTEXT,
        metadata LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // 3. Create Sellers Table
    $pdo->exec("CREATE TABLE sellers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        rating DECIMAL(3,2) DEFAULT 5.00,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 4. Create Products Table
    $pdo->exec("CREATE TABLE products (
        id VARCHAR(50) PRIMARY KEY,
        seller_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        image_url LONGTEXT,
        description LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES sellers(id)
    )");

    // 5. Create Orders Table
    $pdo->exec("CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        delivery_address TEXT,
        payment_method VARCHAR(50),
        delivery_agent_name VARCHAR(255),
        delivery_agent_phone VARCHAR(50),
        shipping_method VARCHAR(100) DEFAULT 'STANDARD',
        tracking_number VARCHAR(100),
        estimated_delivery VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 6. Create Order Items Table
    $pdo->exec("CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
    )");

    // 7. Create User Addresses Table
    $pdo->exec("CREATE TABLE user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        label VARCHAR(100),
        address_line1 TEXT NOT NULL,
        city VARCHAR(100) DEFAULT 'Port Blair',
        pincode VARCHAR(20),
        is_default TINYINT(1) DEFAULT 0
    )");

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo json_encode(["status" => "success", "message" => "Sovereign Commerce Engine Synchronized."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
