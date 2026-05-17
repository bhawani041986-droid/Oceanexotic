<?php
header("Content-Type: application/json");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Authorized."]);
    exit;
}

$productId = $_GET['product_id'] ?? null;

if (!$productId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Target Product ID Required."]);
    exit;
}

try {
    $pdo = getDB();
    
    // Auto-Repair Registry: Ensure reviews table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'reviews'")->rowCount();
    if ($tableCheck === 0) {
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
    }

    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE product_id = ? AND status = 'APPROVED' ORDER BY created_at DESC");
    $stmt->execute([$productId]);
    $reviews = $stmt->fetchAll();

    echo json_encode($reviews);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
