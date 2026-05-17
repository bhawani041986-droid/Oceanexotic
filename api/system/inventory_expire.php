<?php
/**
 * OceanExotic — Live Harbor Inventory Expiration Engine
 * 
 * This script automates the archival of stale harbor inventory.
 * Stale inventory is defined as live catches whose catch_date is older than current system date.
 * 
 * GOVERNANCE PROTOCOL:
 * 1. Identify all products with 'is_live_inventory' = 1
 * 2. Filter assets where 'catch_date' < CURRENT_DATE
 * 3. Update 'status' to 'EXPIRED' and 'is_live_inventory' to 0
 */

header("Content-Type: application/json");

require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    $today = date('Y-m-d');

    // PROTOCOL: Identify and Archival
    $stmt = $pdo->prepare("
        UPDATE products 
        SET status = 'EXPIRED', 
            is_live_inventory = 0 
        WHERE is_live_inventory = 1 
        AND catch_date < :today
    ");

    $stmt->execute(['today' => $today]);
    $affected = $stmt->rowCount();

    echo json_encode([
        "status" => "success",
        "timestamp" => date('Y-m-d H:i:s'),
        "protocol" => "HARBOR_EXPIRATION",
        "affected_nodes" => $affected,
        "message" => "Sovereign Registry archived $affected stale harbor batches."
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "protocol" => "HARBOR_EXPIRATION_FAILURE",
        "message" => $e->getMessage()
    ]);
}
?>
