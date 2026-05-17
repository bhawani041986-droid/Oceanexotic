<?php
header("Content-Type: application/json");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Authorized."]);
    exit;
}

$sellerId = $_GET['seller_id'] ?? null;

if (!$sellerId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Target Seller ID Required."]);
    exit;
}

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE seller_id = ? AND status = 'APPROVED' ORDER BY created_at DESC");
    $stmt->execute([$sellerId]);
    $reviews = $stmt->fetchAll();

    echo json_encode($reviews);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
