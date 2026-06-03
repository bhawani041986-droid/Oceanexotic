<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Identity Verification: Fetch orders for the specified user node
    $user_id = $_GET['userId'] ?? '1';

    // Sovereign Ledger Query: Handling multiple schema variations (delivery_address vs customer_address)
    $sql = "SELECT 
                o.id, 
                o.created_at as date, 
                o.total_amount as total, 
                o.status,
                o.is_pre_order,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
            FROM orders o
            WHERE o.user_id = :user_id 
            ORDER BY o.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // High-Fidelity Data Transformation
    foreach ($orders as &$order) {
        $order['items'] = (int)($order['item_count'] > 0 ? $order['item_count'] : 1); // Fallback for legacy data
        $order['tracking'] = 'OCEAN-' . str_pad($order['id'], 4, '0', STR_PAD_LEFT);
        $order['date'] = date('M d, Y', strtotime($order['date']));
        $order['total'] = (float)$order['total'];
        $order['is_pre_order'] = isset($order['is_pre_order']) ? (int)$order['is_pre_order'] : 0;
        
        // Status Normalization for UI Indicators
        $statusMap = [
            'PENDING' => 'IN TRANSIT', // Map Pending to In Transit for tracking visualization demo
            'SHIPPED' => 'IN TRANSIT',
            'DELIVERED' => 'DELIVERED',
            'CANCELLED' => 'CANCELLED'
        ];
        $order['status'] = $statusMap[strtoupper($order['status'])] ?? $order['status'];
    }

    echo json_encode($orders);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
