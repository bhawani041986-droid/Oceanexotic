<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);
require_once __DIR__ . '/../../db.php';

$sellerId = $_GET['seller_id'] ?? 'SEL-001';

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM seller_withdrawals WHERE seller_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sellerId]);
    $withdrawals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format for frontend
    $result = array_map(function($wth) {
        return [
            'id' => "WTH-" . str_pad($wth['id'], 4, '0', STR_PAD_LEFT),
            'amount' => "₹" . number_format($wth['amount'], 2),
            'raw_amount' => $wth['amount'],
            'node' => $wth['bank_node'],
            'status' => $wth['status'],
            'date' => date('M d, Y', strtotime($wth['created_at']))
        ];
    }, $withdrawals);

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
