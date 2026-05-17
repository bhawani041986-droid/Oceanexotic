<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../db.php';

$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $order_id_raw = $data['order_id'] ?? '';
    // Strip "ORD-" prefix if present
    $order_id = str_replace("ORD-", "", $order_id_raw);
    $order_id = (int)ltrim($order_id, '0');

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
            'status' => $data['status'] ?? 'PENDING',
            'agent_name' => $data['delivery_agent_name'] ?? null,
            'agent_phone' => $data['delivery_agent_phone'] ?? null,
            'shipping_method' => $data['shipping_method'] ?? 'STANDARD',
            'tracking_number' => $data['tracking_number'] ?? null,
            'est_delivery' => $data['estimated_delivery'] ?? null,
            'id' => $order_id
        ]);

        echo json_encode(["status" => "success", "message" => "Logistics synchronized for order $order_id_raw"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

try {
    // Fetch orders with customer names
    $query = "
        SELECT 
            o.*,
            u.name as customer_name,
            (SELECT s.name FROM sellers s 
             JOIN products p ON s.id = p.seller_id 
             JOIN order_items oi ON p.id = oi.product_id 
             WHERE oi.order_id = o.id LIMIT 1) as seller_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ";

    $stmt = $pdo->query($query);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($o) {
        return [
            'id' => 'ORD-' . str_pad($o['id'], 6, '0', STR_PAD_LEFT),
            'customer_name' => $o['customer_name'] ?? 'Guest Customer',
            'seller_name' => $o['seller_name'] ?? 'Andaman Fleet',
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
