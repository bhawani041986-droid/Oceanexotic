<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Identity ID and Status are required."]);
    exit;
}

try {
    $pdo = getDB();
    $userId = $data['id'];
    $rawStatus = strtoupper($data['status']);
    
    // Map status: ACTIVE / VERIFIED -> ACTIVE, PENDING -> PENDING, INACTIVE / SUSPENDED -> INACTIVE
    $status = 'ACTIVE';
    if ($rawStatus === 'PENDING') {
        $status = 'PENDING';
    } elseif ($rawStatus === 'INACTIVE' || $rawStatus === 'SUSPENDED') {
        $status = 'INACTIVE';
    }

    // 1. Update users table
    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
    $stmt->execute([$status, $userId]);

    // 2. Fetch user to check role
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && $user['role'] === 'AGENT') {
        if ($status === 'ACTIVE') {
            // Check if agent already exists in delivery_agents
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM delivery_agents WHERE id = ?");
            $stmt->execute([$userId]);
            $exists = $stmt->fetchColumn() > 0;

            if (!$exists) {
                // Synchronize and insert into delivery_agents
                $phone = '+91-9' . rand(100000000, 999999999); // Generate a random phone number if not present
                $stmt = $pdo->prepare("INSERT INTO delivery_agents (id, name, phone, zone, status) VALUES (?, ?, ?, 'Port Blair Central', 'ACTIVE')");
                $stmt->execute([$userId, $user['name'], $phone]);
            } else {
                // If exists, make sure they are active in delivery_agents table
                $stmt = $pdo->prepare("UPDATE delivery_agents SET status = 'ACTIVE' WHERE id = ?");
                $stmt->execute([$userId]);
            }
        } else {
            // If INACTIVE or PENDING, set delivery_agent status to INACTIVE
            $stmt = $pdo->prepare("UPDATE delivery_agents SET status = 'INACTIVE' WHERE id = ?");
            $stmt->execute([$userId]);
        }
    }

    echo json_encode(["status" => "success", "message" => "Status updated successfully.", "db_status" => $status]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
