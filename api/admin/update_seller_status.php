<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../db.php';

$data = json_decode(file_get_contents('php://input'), true);

$sellerId = $data['id'] ?? null;
$status = $data['status'] ?? null;

if (!$sellerId || !$status) {
    http_response_code(400);
    echo json_encode(["error" => "Node ID and target status required."]);
    exit;
}

// Convert UI status to DB status
$dbStatus = ($status === 'VERIFIED') ? 'ACTIVE' : 'SUSPENDED';

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ? AND role = 'SELLER'");
    $stmt->execute([$dbStatus, $sellerId]);

    echo json_encode(["success" => true, "new_status" => $status]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
