<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../db.php';

$data = json_decode(file_get_contents('php://input'), true);

$sellerId = $data['seller_id'] ?? null;
$amount = $data['amount'] ?? 0;
$bankNode = $data['bank_node'] ?? '';

if (!$sellerId || $amount <= 0 || !$bankNode) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid parameters for yield liquidation."]);
    exit;
}

try {
    $pdo = getDB();
    
    // In a real app, we'd check balance here.
    // For now, we just record the request.
    
    $stmt = $pdo->prepare("INSERT INTO seller_withdrawals (seller_id, amount, bank_node, status) VALUES (?, ?, ?, 'PENDING')");
    $stmt->execute([$sellerId, $amount, $bankNode]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
