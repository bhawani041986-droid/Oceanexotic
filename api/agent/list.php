<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once '../../db.php';

try {
    $pdo = getDB();
    $agents = $pdo->query("SELECT id, name, phone, zone, status FROM delivery_agents WHERE status = 'ACTIVE' ORDER BY name")
                  ->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($agents);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
