<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
require_once '../../db.php';

/**
 * ORDER AUDIT REGISTRY
 * Fetches reviews associated with a specific order.
 */

if (!isset($_GET['order_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Order ID Missing."]);
    exit;
}

try {
    $pdo = getDB();
    $order_id = $_GET['order_id'];
    
    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE order_id = ?");
    $stmt->execute([$order_id]);
    
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reviews);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Order Registry Access Failure: " . $e->getMessage()]);
}
?>
