<?php
header("Content-Type: application/json");
require_once '../../db.php';
try {
    $pdo = getDB();
    $pdo->exec("DROP TABLE IF EXISTS harvest_orders");
    $pdo->exec("CREATE TABLE harvest_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ord_num VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        seller_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'DELIVERED'
    )");
    
    $pdo->exec("INSERT INTO harvest_orders (ord_num, user_id, product_id, seller_id, amount, status) VALUES ('ORD-9982', 'USR-123', 'p1', '4', 8500.00, 'DELIVERED')");
    $pdo->exec("INSERT INTO harvest_orders (ord_num, user_id, product_id, seller_id, amount, status) VALUES ('ORD-9982', 'USR-123', 'p2', '4', 3160.00, 'DELIVERED')");
    
    echo json_encode(["status" => "success", "message" => "Harvest Orders Synchronized"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
