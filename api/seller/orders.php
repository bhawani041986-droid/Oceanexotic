<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../db.php';

$pdo = getDB();
$seller_id = $_GET['seller_id'] ?? 'SEL-001'; // Default for testing

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $order_id_raw = $data['order_id'] ?? '';
    $order_id = str_replace("ORD-", "", $order_id_raw);
    $order_id = (int)ltrim($order_id, '0');

    // agent_id is canonical from the registry dropdown
    $agent_id = trim($data['delivery_agent_name'] ?? '');
    $agent_phone = $data['delivery_agent_phone'] ?? '';

    // If phone not provided, look up from registry
    if (empty($agent_phone) && !empty($agent_id)) {
        try {
            $agentStmt = $pdo->prepare("SELECT phone FROM delivery_agents WHERE id = :id");
            $agentStmt->execute(['id' => $agent_id]);
            $agentRow = $agentStmt->fetch(PDO::FETCH_ASSOC);
            if ($agentRow) $agent_phone = $agentRow['phone'];
        } catch (Exception $e) {}
    }

    try {
        $stmt = $pdo->prepare("UPDATE orders SET 
            status = :status,
            delivery_agent_name = :agent_name,
            delivery_agent_phone = :agent_phone,
            shipping_method = :shipping_method,
            tracking_number = :tracking_number,
            estimated_delivery = :est_delivery
            WHERE id = :id");
        
        $stmt->execute([
            'status'        => $data['status'] ?? 'SHIPPED',
            'agent_name'    => $agent_id,
            'agent_phone'   => $agent_phone,
            'shipping_method' => $data['shipping_method'] ?? 'STANDARD',
            'tracking_number' => $data['tracking_number'] ?? null,
            'est_delivery'  => $data['estimated_delivery'] ?? null,
            'id'            => $order_id
        ]);

        echo json_encode(["status" => "success", "message" => "Vessel Dispatch Initialized for $order_id_raw"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

try {
    // Fetch orders that contain products from this seller
    $query = "
        SELECT DISTINCT
            o.*,
            u.name as customer_name
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE p.seller_id = :seller_id
        ORDER BY o.created_at DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['seller_id' => $seller_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($o) {
        return [
            'id' => 'ORD-' . str_pad($o['id'], 6, '0', STR_PAD_LEFT),
            'customer_name' => $o['customer_name'] ?? 'Guest Customer',
            'total_amount' => (float)$o['total_amount'],
            'status' => $o['status'],
            'delivery_address' => $o['delivery_address'],
            'delivery_agent_name' => $o['delivery_agent_name'],
            'delivery_agent_phone' => $o['delivery_agent_phone'],
            'shipping_method' => $o['shipping_method'],
            'tracking_number' => $o['tracking_number'],
            'estimated_delivery' => $o['estimated_delivery'],
            'created_at' => $o['created_at']
        ];
    }, $orders);

    echo json_encode($formatted);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
