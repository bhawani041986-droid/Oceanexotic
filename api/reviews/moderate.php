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

    if (!$data || !isset($data['id'], $data['action'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete Governance Directive."]);
        exit;
    }

    $id = $data['id'];
    $actionInput = strtoupper($data['action']); // Harmonize to uppercase
    
    // Command Mapping
    $action = $actionInput;
    if ($actionInput === 'APPROVE') $action = 'APPROVED';
    if ($actionInput === 'REJECT' || $actionInput === 'DISAPPROVE') $action = 'REJECTED';

    if ($action === 'DELETE' || $action === 'PURGE') {
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Registry Node Purged.", "id" => $id]);
        exit;
    }

    if (!in_array($action, ['APPROVED', 'REJECTED', 'PENDING', 'FLAGGED'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid Governance Action: " . $action]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE reviews SET status = ? WHERE id = ?");
    $stmt->execute([$action, $id]);

    echo json_encode(["status" => "success", "message" => "Registry Node Moderated.", "id" => $id, "action" => $action]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Registry Conflict: " . $e->getMessage()]);
}
?>
