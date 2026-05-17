<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Add territory_id to users table for seller mapping
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS territory_id INT NULL");
    $pdo->exec("ALTER TABLE users ADD INDEX (territory_id)");

    // Get Port Blair Port ID
    $stmt = $pdo->query("SELECT id FROM maritime_territories WHERE name = 'Port Blair' LIMIT 1");
    $portBlairId = $stmt->fetchColumn();

    // Get Phoenix Bay Jetty ID
    $stmt = $pdo->query("SELECT id FROM maritime_territories WHERE name = 'Phoenix Bay Jetty' LIMIT 1");
    $phoenixId = $stmt->fetchColumn();

    // Map existing sellers (assuming user_id starts with 'SEL' or role is 'SELLER')
    $pdo->exec("UPDATE users SET territory_id = $portBlairId WHERE role = 'SELLER' OR id LIKE 'SEL%'");

    echo json_encode([
        "status" => "success", 
        "message" => "Sovereign Seller-Territory Mapping Initialized.",
        "port_blair_id" => $portBlairId,
        "phoenix_id" => $phoenixId
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
