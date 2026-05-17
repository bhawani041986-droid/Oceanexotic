<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $details = [];
    foreach ($tables as $table) {
        $stmt = $pdo->query("DESCRIBE $table");
        $details[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(["status" => "success", "tables" => $details]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
