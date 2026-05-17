<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT 1");
    echo json_encode(["status" => "success", "message" => "Database heartbeat detected.", "port" => 3307]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database node offline: " . $e->getMessage()]);
}
?>
