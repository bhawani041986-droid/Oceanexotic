<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Identity ID is required for synchronization."]);
    exit;
}

try {
    $pdo = getDB();
    
    // Sovereign Registry Synchronization: Updating user parameters
    $password = $data['password'];
    // Only hash if it's not already hashed (mock check: starts with $2y$)
    if (strpos($password, '$2y$') !== 0) {
        $password = password_hash($password, PASSWORD_DEFAULT);
    }

    $sql = "UPDATE users SET 
                name = :name, 
                email = :email, 
                role = :role, 
                status = :status, 
                password = :password
            WHERE id = :id";
            
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        'name' => $data['name'],
        'email' => $data['email'],
        'role' => $data['role'],
        'status' => $data['status'],
        'password' => $password,
        'id' => $data['id']
    ]);

    if ($result) {
        // Synchronize delivery agent registry if the user is an AGENT
        $role = strtoupper($data['role'] ?? '');
        $status = strtoupper($data['status'] ?? '');
        if ($role === 'AGENT') {
            if ($status === 'ACTIVE') {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM delivery_agents WHERE id = ?");
                $stmt->execute([$data['id']]);
                $exists = $stmt->fetchColumn() > 0;
                if (!$exists) {
                    $phone = '+91-9' . rand(100000000, 999999999);
                    $stmt = $pdo->prepare("INSERT INTO delivery_agents (id, name, phone, zone, status) VALUES (?, ?, ?, 'Port Blair Central', 'ACTIVE')");
                    $stmt->execute([$data['id'], $data['name'], $phone]);
                } else {
                    $stmt = $pdo->prepare("UPDATE delivery_agents SET status = 'ACTIVE' WHERE id = ?");
                    $stmt->execute([$data['id']]);
                }
            } else {
                $stmt = $pdo->prepare("UPDATE delivery_agents SET status = 'INACTIVE' WHERE id = ?");
                $stmt->execute([$data['id']]);
            }
        }

        echo json_encode(["status" => "success", "message" => "Sovereign identity synchronized successfully."]);
    } else {
        throw new Exception("Handshake failed with the registry.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
