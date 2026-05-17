<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);
require_once __DIR__ . '/../../db.php';

$sellerId = $_GET['seller_id'] ?? null;

if (!$sellerId) {
    http_response_code(400);
    echo json_encode(["error" => "Node ID required for audit."]);
    exit;
}

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM seller_verification_docs WHERE seller_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sellerId]);
    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = array_map(function($d) {
        return [
            'id' => $d['id'],
            'display_id' => "DOC-" . str_pad($d['id'], 4, '0', STR_PAD_LEFT),
            'title' => $d['title'],
            'type' => $d['doc_type'],
            'status' => $d['status'],
            'file_path' => $d['file_path'],
            'expiry' => date('M d, Y', strtotime($d['expiry_date'])),
            'date' => date('M d, Y', strtotime($d['created_at']))
        ];
    }, $docs);

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
