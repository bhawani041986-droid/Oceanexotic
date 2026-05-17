<?php
header("Content-Type: application/json");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Authorized."]);
    exit;
}

try {
    $pdo = getDB();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['product_id'], $data['seller_id'], $data['user_id'], $data['rating'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete Telemetry Nodes."]);
        exit;
    }

    // Verify Purchase Integrity
    $checkOrder = $pdo->prepare("SELECT id FROM verified_orders WHERE order_ref = ? AND user_id = ? AND product_id = ? AND seller_id = ? AND status IN ('SHIPPED', 'DELIVERED') LIMIT 1");
    $checkOrder->execute([$data['order_id'] ?? '', $data['user_id'], $data['product_id'], $data['seller_id']]);
    $order = $checkOrder->fetch();

    if (!$order) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Purchase Verification Failed. Only customers with valid maritime transactions can leave feedback."]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO reviews (product_id, product_name, seller_id, user_id, user_name, rating, comment, evidence_gallery, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['product_id'],
        $data['product_name'] ?? 'Fleet Asset',
        $data['seller_id'],
        $data['user_id'],
        $data['user_name'] ?? 'Citizen',
        $data['rating'],
        $data['comment'] ?? '',
        $data['photos'] ?? null,
        $order['id']
    ]);

    echo json_encode(["status" => "success", "message" => "Review Registry Synchronized.", "id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
