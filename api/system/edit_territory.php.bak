<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Authorized."]);
    exit;
}

try {
    $pdo = getDB();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['id'], $data['name'], $data['zone_type'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Territory manifest incomplete."]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE maritime_territories SET name = ?, zone_type = ?, parent_id = ? WHERE id = ?");
    $stmt->execute([
        $data['name'],
        $data['zone_type'],
        $data['parent_id'] ?: null,
        $data['id']
    ]);

    echo json_encode([
        "status" => "success", 
        "message" => "Maritime Node Re-commissioned."
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
