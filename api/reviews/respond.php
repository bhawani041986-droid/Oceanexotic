<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Authorized."]);
    exit;
}

try {
    $pdo = getDB();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['id'], $data['response'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete Response Telemetry."]);
        exit;
    }

    $id = $data['id'];
    $response = $data['response'];

    $stmt = $pdo->prepare("UPDATE reviews SET seller_response = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$response, $id]);

    echo json_encode(["status" => "success", "message" => "Response Broadcasted to Marketplace Registry.", "id" => $id]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Registry Conflict: " . $e->getMessage()]);
}
?>
