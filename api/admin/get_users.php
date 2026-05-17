<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    
    $stmt = $pdo->prepare("SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    $users = $stmt->fetchAll();

    // Add some metadata for UI
    foreach ($users as &$user) {
        $user['joined'] = date('M Y', strtotime($user['created_at']));
        $user['status'] = $user['status'] ?? 'VERIFIED';
        $user['orders'] = rand(0, 15); // Mock trade volume for demo
        $user['rank'] = $user['role'] === 'SELLER' ? 'MERCHANT' : ($user['role'] === 'AGENT' ? 'LOGISTICS' : 'CITIZEN');
    }

    echo json_encode($users);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
