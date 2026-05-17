<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
require_once '../../db.php';

/**
 * CITIZEN AUDIT LOG (CUSTOMER)
 * Fetches all reviews submitted by a specific user.
 */

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User Identity Missing."]);
    exit;
}

try {
    $pdo = getDB();
    $user_id = $_GET['user_id'];
    
    $stmt = $pdo->prepare("SELECT r.*, r.evidence_gallery as photos FROM reviews r WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reviews);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Ledger Access Failure: " . $e->getMessage()]);
}
?>
