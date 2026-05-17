<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../db.php';

try {
    $stmt = $pdo->query("SELECT 1");
    echo json_encode(["status" => "ok", "db" => "connected"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
