<?php
header("Content-Type: application/json");
require_once '../../db.php';
try {
    $pdo = getDB();
    $pdo->exec("DROP TABLE IF EXISTS orders");
    $pdo->exec("CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        seller_id VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    $stmt = $pdo->query("DESCRIBE orders");
    $columns = $stmt->fetchAll();
    
    echo json_encode(["status" => "success", "columns" => $columns]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
