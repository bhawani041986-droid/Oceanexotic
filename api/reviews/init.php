<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Force recreate Reviews Table for verified governance
    $pdo->exec("DROP TABLE IF EXISTS reviews");
    $pdo->exec("CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(255),
        seller_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        evidence_gallery LONGTEXT,
        status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED') DEFAULT 'PENDING',
        order_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (product_id),
        INDEX (seller_id),
        INDEX (user_id),
        INDEX (status)
    )");

    echo json_encode(["status" => "success", "message" => "Review Registry Recalibrated."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
