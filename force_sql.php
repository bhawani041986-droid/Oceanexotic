<?php
header("Content-Type: application/json");
require_once 'db.php';

try {
    $pdo = getDB();
    
    // Explicitly Drop and Recreate
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DROP TABLE IF EXISTS products");
    $pdo->exec("DROP TABLE IF EXISTS users");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    $pdo->exec("CREATE TABLE users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'SELLER', 'CUSTOMER') DEFAULT 'CUSTOMER',
        territory_id INT NULL,
        status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        image VARCHAR(255),
        seller_id VARCHAR(50),
        category VARCHAR(100),
        freshness VARCHAR(50) DEFAULT 'FRESH CATCH',
        delivery_time VARCHAR(20) DEFAULT '12h',
        description TEXT,
        status ENUM('AVAILABLE', 'OUT_OF_STOCK') DEFAULT 'AVAILABLE',
        rating DECIMAL(3,2) DEFAULT 4.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    $stmt = $pdo->query("DESCRIBE products");
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
