<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
require_once '../../db.php';

/**
 * GLOBAL FEEDBACK LEDGER (ADMIN)
 * Fetches all reviews across the maritime marketplace for moderation.
 */

try {
    $pdo = getDB();
    // Fetch all reviews, prioritizing pending and flagged directives
    $stmt = $pdo->query("SELECT r.*, r.evidence_gallery as photos, u.name as seller_name, o.order_ref as order_number,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE seller_id = r.seller_id AND status = 'APPROVED') as seller_avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE seller_id = r.seller_id) as seller_total_reviews
        FROM reviews r 
        LEFT JOIN users u ON r.seller_id = u.id
        LEFT JOIN verified_orders o ON r.order_id = o.id
        ORDER BY 
        CASE 
            WHEN r.status = 'PENDING' THEN 1
            WHEN r.status = 'FLAGGED' THEN 2
            WHEN r.status = 'APPROVED' THEN 3
            ELSE 4
        END, r.created_at DESC");
    
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reviews);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Registry Access Failure: " . $e->getMessage()]);
}
?>
