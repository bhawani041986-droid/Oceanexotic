<?php
header("Content-Type: application/json");
require_once '../../db.php';
try {
    $pdo = getDB();
    $pdo->exec("DROP TABLE IF EXISTS verified_orders");
    $pdo->exec("CREATE TABLE verified_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_ref VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        seller_id VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'DELIVERED'
    )");
    
    $pdo->exec("INSERT INTO verified_orders (order_ref, user_id, product_id, seller_id, status) VALUES ('ORD-9982', 'USR-123', 'p1', '4', 'DELIVERED')");
    $pdo->exec("INSERT INTO verified_orders (order_ref, user_id, product_id, seller_id, status) VALUES ('ORD-9982', 'USR-123', 'p2', '4', 'DELIVERED')");
    
    echo json_encode(["status" => "success", "message" => "Verified Orders Fresh Registry Initialized"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
