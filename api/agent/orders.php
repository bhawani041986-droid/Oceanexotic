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
            u.name as customer_name,
            u.email as customer_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE TRIM(o.delivery_agent_name) = :agent_id
        ORDER BY o.created_at DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['agent_id' => $agent_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($o) use ($pdo) {
        // Fetch items for this order
        $itemStmt = $pdo->prepare("
            SELECT oi.quantity, p.name 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = :order_id
        ");
        $itemStmt->execute(['order_id' => $o['id']]);
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'id'           => 'ORD-' . str_pad($o['id'], 6, '0', STR_PAD_LEFT),
            'customer'     => $o['customer_name'] ?? 'Guest Customer',
            'customer_email' => $o['customer_email'] ?? 'customer@oceanfresh.com',
            'location'     => $o['delivery_address'] ?? 'Andaman Hub',
            'time'         => $o['created_at'],
            'status'       => $o['status'],
            'urgency'      => in_array($o['status'], ['PENDING', 'SHIPPED']) ? 'HIGH' : 'NORMAL',
            'is_pre_order' => isset($o['is_pre_order']) ? (int)$o['is_pre_order'] : 0,
            'items'        => array_map(function($item) {
                return [
                    'name' => $item['name'],
                    'qty' => $item['quantity'] . ' units'
                ];
            }, $items),
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
