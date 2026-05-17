<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("
        SELECT w.*, u.name as seller_name 
        FROM seller_withdrawals w
        JOIN users u ON w.seller_id = u.id
        ORDER BY w.created_at DESC
    ");
    $withdrawals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format for admin dashboard
    $result = array_map(function($wth) {
        return [
            'id' => $wth['id'],
            'display_id' => "WTH-" . str_pad($wth['id'], 4, '0', STR_PAD_LEFT),
            'seller_id' => $wth['seller_id'],
            'seller_name' => $wth['seller_name'],
            'amount' => "₹" . number_format($wth['amount'], 2),
            'raw_amount' => $wth['amount'],
            'bank_node' => $wth['bank_node'],
            'status' => $wth['status'],
            'date' => date('M d, Y H:i', strtotime($wth['created_at']))
        ];
    }, $withdrawals);

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
