<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);
require_once __DIR__ . '/../../db.php';

$sellerId = $_GET['seller_id'] ?? 'SEL-001';

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM seller_verification_docs WHERE seller_id = ? ORDER BY created_at DESC");
    $stmt->execute([$sellerId]);
    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate progress
    $total = count($docs);
    $verified = count(array_filter($docs, function($d) { return $d['status'] === 'VERIFIED'; }));
    $progress = $total > 0 ? round(($verified / $total) * 100) : 0;

    $formattedDocs = array_map(function($d) {
        return [
            'id' => "DOC-" . str_pad($d['id'], 4, '0', STR_PAD_LEFT),
            'title' => $d['title'],
            'status' => $d['status'],
            'expiry' => date('M Y', strtotime($d['expiry_date'])),
            'type' => $d['doc_type']
        ];
    }, $docs);

    echo json_encode([
        "progress" => $progress,
        "rank" => $progress >= 100 ? "LEVEL 3: FULLY VERIFIED" : ($progress >= 50 ? "LEVEL 2: PARTIALLY VERIFIED" : "LEVEL 1: INITIAL NODE"),
        "documents" => $formattedDocs
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
