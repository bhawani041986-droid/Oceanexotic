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
    $order_id = $_GET['id'] ?? '';

    if (!$order_id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing order ID"]);
        exit;
    }

    // Fetch order details
    $orderStmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id LIMIT 1");
    $orderStmt->execute(['id' => $order_id]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(["error" => "Order not found"]);
        exit;
    }

    // Fetch order items with product and seller info
    // Assuming products table has seller_id and sellers table has name
    $itemsSql = "
        SELECT 
            oi.*,
            p.name AS product_name,
            p.image_url,
            p.seller_id,
            s.business_name AS seller_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN sellers s ON p.seller_id = s.id
        WHERE oi.order_id = :id
    ";
    
    $itemsStmt = $pdo->prepare($itemsSql);
    $itemsStmt->execute(['id' => $order_id]);
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    $subtotal = 0;
    foreach ($items as &$item) {
        $subtotal += floatval($item['price']) * floatval($item['quantity'] ?? 1);
        if (!$item['image_url']) {
            $item['image_url'] = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400";
        }
    }

    $total = floatval($order['total_amount'] ?? 0);
    $shipping = 0;
    $tax = round(max(0, $total - $subtotal - $shipping), 2);

    $orderData = $order;
    $orderData['subtotal'] = $subtotal;
    $orderData['shipping'] = $shipping;
    $orderData['tax'] = $tax;
    $orderData['total'] = $total;
    $orderData['items'] = $items;

    echo json_encode($orderData);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal server error", "message" => $e->getMessage()]);
}
?>
