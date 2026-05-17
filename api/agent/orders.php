<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../db.php';

$pdo = getDB();

// The agent ID is queried — trim to be safe
$agent_id = trim($_GET['agent_id'] ?? $_GET['agent_name'] ?? '');

try {
    $query = "
        SELECT 
            o.*,
            u.name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE TRIM(o.delivery_agent_name) = :agent_id
        ORDER BY o.created_at DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['agent_id' => $agent_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($o) {
        return [
            'id'           => 'ORD-' . str_pad($o['id'], 6, '0', STR_PAD_LEFT),
            'customer'     => $o['customer_name'] ?? 'Guest Customer',
            'location'     => $o['delivery_address'] ?? 'Andaman Hub',
            'time'         => $o['created_at'],
            'status'       => $o['status'],
            'urgency'      => in_array($o['status'], ['PENDING', 'SHIPPED']) ? 'HIGH' : 'NORMAL',
            'agent_details' => [
                'name'        => trim($o['delivery_agent_name'] ?? ''),
                'phone'       => $o['delivery_agent_phone'],
                'method'      => $o['shipping_method'],
                'tracking'    => $o['tracking_number'],
                'est_delivery' => $o['estimated_delivery']
            ]
        ];
    }, $orders);

    echo json_encode($formatted);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
