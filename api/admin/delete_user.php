<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../db.php';

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['id'] ?? $_GET['id'] ?? $_POST['id'] ?? '';

if (empty($userId)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Identity ID is required for deletion."]);
    exit;
}

try {
    $pdo = getDB();
    $pdo->beginTransaction();
    
    // Disable FK checks to avoid cascade constraint issues during deletion
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Delete from delivery_agents
    $stmt = $pdo->prepare("DELETE FROM delivery_agents WHERE id = ?");
    $stmt->execute([$userId]);
    
    // Delete from sellers
    $stmt = $pdo->prepare("DELETE FROM sellers WHERE id = ?");
    $stmt->execute([$userId]);
    
    // Delete from users
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    $pdo->commit();
    
    echo json_encode(["status" => "success", "message" => "Sovereign identity and dependencies deleted successfully."]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
