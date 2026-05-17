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

$withdrawalId = $data['id'] ?? null;
$status = $data['status'] ?? null;

if (!$withdrawalId || !$status) {
    http_response_code(400);
    echo json_encode(["error" => "Missing directive ID or status."]);
    exit;
}

$validStatuses = ['PENDING', 'PROCESSING', 'SETTLED', 'CANCELLED'];
if (!in_array($status, $validStatuses)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status transition."]);
    exit;
}

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("UPDATE seller_withdrawals SET status = ? WHERE id = ?");
    $stmt->execute([$status, $withdrawalId]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
