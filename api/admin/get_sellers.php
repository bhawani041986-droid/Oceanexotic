<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("
        SELECT u.id, u.name, u.email, u.status, u.created_at,
        (SELECT COUNT(*) FROM seller_verification_docs WHERE seller_id = u.id AND status = 'VERIFIED') as verified_count,
        (SELECT COUNT(*) FROM seller_verification_docs WHERE seller_id = u.id) as total_docs
        FROM users u 
        WHERE u.role = 'SELLER'
        ORDER BY u.created_at DESC
    ");
    $sellers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($sellers === false) {
        throw new Exception("Failed to fetch seller nodes from the registry.");
    }

    $result = array_map(function($s) {
        $progress = $s['total_docs'] > 0 ? round(($s['verified_count'] / $s['total_docs']) * 100) : 0;
        
        // Accurate status mapping
        $uiStatus = 'PENDING';
        if ($s['status'] === 'ACTIVE') $uiStatus = 'VERIFIED';
        if ($s['status'] === 'SUSPENDED') $uiStatus = 'SUSPENDED';

        return [
            'id' => $s['id'],
            'name' => $s['name'],
            'email' => $s['email'],
            'status' => $uiStatus,
            'lead' => explode(' ', $s['name'])[0],
            'revenue' => "₹" . number_format(rand(100000, 2000000)),
            'commission' => "12%",
            'products' => rand(10, 100),
            'rating' => number_format(4 + (rand(0, 10) / 10), 1),
            'health' => ($uiStatus === 'VERIFIED') ? "OPTIMAL" : (($uiStatus === 'PENDING') ? "PENDING" : "CRITICAL"),
            'progress' => $progress
        ];
    }, $sellers);

    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Fleet Synchronization Fault",
        "message" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}
?>
