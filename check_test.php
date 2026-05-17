<?php
header("Content-Type: application/json");
require_once 'db.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT * FROM reviews ORDER BY id DESC LIMIT 1");
    $latest = $stmt->fetch();

    if ($latest) {
        echo json_encode(["status" => "success", "latest_review" => $latest]);
    } else {
        echo json_encode(["status" => "empty", "message" => "No telemetry found in registry."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
