<?php
/**
 * OceanExotic — Inventory Expiration Engine
 * Automated cleanup of stale harbor batches.
 * Frequency: Every 12 hours (Cron)
 */

require_once '../../db.php';

header('Content-Type: application/json');

try {
    // 1. Identify expired batches
    $stmt = $pdo->prepare("SELECT catch_id, product_id, quantity_kg FROM todays_catch WHERE expires_at < NOW()");
    $stmt->execute();
    $expired = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($expired)) {
        echo json_encode(['status' => 'success', 'message' => 'No expired inventory found.']);
        exit;
    }

    $pdo->beginTransaction();

    foreach ($expired as $batch) {
        // 2. Log to archival registry
        $logStmt = $pdo->prepare("INSERT INTO inventory_logs (catch_id, product_id, action_type, quantity_change, reason) VALUES (?, ?, 'ARCHIVE', ?, 'BATCH_EXPIRED')");
        $logStmt->execute([$batch['catch_id'], $batch['product_id'], -$batch['quantity_kg']]);

        // 3. Mark product as not live if no other catch exists (simplified)
        $updateProd = $pdo->prepare("UPDATE products SET is_live_inventory = 0 WHERE id = ? AND NOT EXISTS (SELECT 1 FROM todays_catch WHERE product_id = ? AND expires_at > NOW())");
        $updateProd->execute([$batch['product_id'], $batch['product_id']]);
    }

    // 4. Purge expired batches
    $purge = $pdo->prepare("DELETE FROM todays_catch WHERE expires_at < NOW()");
    $purge->execute();

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'archived_count' => count($expired),
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
