<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once __DIR__ . '/../../db.php';

$sellerId = $_GET['seller_id'] ?? 'SEL-001';

try {
    $pdo = getDB();
    
    // In a real app, calculate from orders and withdrawals.
    // Mocked for the demo experience.
    
    $stats = [
        [ "label" => "Available Yield", "value" => "₹4,26,450", "icon_type" => "rupee", "trend" => "+12.4%" ],
        [ "label" => "Pending", "value" => "₹82,000", "icon_type" => "clock", "trend" => "Active" ],
        [ "label" => "Earnings", "value" => "₹15,80,000", "icon_type" => "trending", "trend" => "LTD" ],
        [ "label" => "Limit", "value" => "₹5,00,000", "icon_type" => "shield", "trend" => "Weekly" ]
    ];

    echo json_encode($stats);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
