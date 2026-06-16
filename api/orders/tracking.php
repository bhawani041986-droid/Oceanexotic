<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../db.php';

try {
    $pdo = getDB();
    $order_id = $_GET['id'] ?? '';

    if (!$order_id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing order ID"]);
        exit;
    }

    // Fetch order details
    $orderStmt = $pdo->prepare("SELECT id, status, created_at, estimated_delivery, delivery_area, user_id, delivery_address FROM orders WHERE id = :id LIMIT 1");
    $orderStmt->execute(['id' => $order_id]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(["error" => "Order not found"]);
        exit;
    }

    // Fetch fleet tracking
    $fleetStmt = $pdo->prepare("SELECT current_lat, current_lng, estimated_arrival, status, last_updated, agent_name, current_temp FROM fleet_tracking WHERE order_id = :id LIMIT 1");
    $fleetStmt->execute(['id' => $order_id]);
    $fleetTracking = $fleetStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "order" => $order,
        "fleetTracking" => $fleetTracking ?: null
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal server error", "message" => $e->getMessage()]);
}
?>
