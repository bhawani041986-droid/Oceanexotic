<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../db.php';

try {
    $pdo = getDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['items']) || empty($data['items'])) {
        throw new Exception("Empty cart or invalid payload.");
    }

    // Verify all products exist in the registry (stale cart check)
    $product_check_stmt = $pdo->prepare("SELECT id FROM products WHERE id = :id");
    $item_base_ids = [];
    foreach ($data['items'] as $item) {
        $base_id = $item['id'];
        $product_check_stmt->execute(['id' => $base_id]);
        if (!$product_check_stmt->fetch()) {
            $last_hyphen = strrpos($item['id'], '-');
            if ($last_hyphen !== false) {
                $stripped_id = substr($item['id'], 0, $last_hyphen);
                $product_check_stmt->execute(['id' => $stripped_id]);
                if ($product_check_stmt->fetch()) {
                    $base_id = $stripped_id;
                } else {
                    throw new Exception("The asset '" . $item['name'] . "' (ID: " . $item['id'] . ") is no longer available in the Sovereign Registry. Please return to the market and refresh your cargo.");
                }
            } else {
                throw new Exception("The asset '" . $item['name'] . "' (ID: " . $item['id'] . ") is no longer available in the Sovereign Registry. Please return to the market and refresh your cargo.");
            }
        }
        $item_base_ids[$item['id']] = $base_id;
    }

    $pdo->beginTransaction();

    // 1. Create Order record
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status, delivery_address, payment_method) 
                           VALUES (:user_id, :total_amount, 'PENDING', :address, :payment)");
    
    $user_id = $data['userId'] ?? 'GUEST-' . time();
    $total = $data['total'];
    $address = $data['address'] ?? 'Default Address';
    $payment = $data['paymentMethod'] ?? 'COD';

    $stmt->execute([
        'user_id' => $user_id,
        'total_amount' => $total,
        'address' => $address,
        'payment' => $payment
    ]);

    $order_id = $pdo->lastInsertId();

    // 2. Insert Order Items
    $item_stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) 
                                VALUES (:order_id, :product_id, :quantity, :price)");

    foreach ($data['items'] as $item) {
        $base_id = $item_base_ids[$item['id']] ?? $item['id'];
        $item_stmt->execute([
            'order_id' => $order_id,
            'product_id' => $base_id,
            'quantity' => $item['quantity'],
            'price' => $item['price']
        ]);

        // 3. Optional: Deduct stock
        $update_stmt = $pdo->prepare("UPDATE products SET stock = stock - :qty WHERE id = :id");
        $update_stmt->execute(['qty' => $item['quantity'], 'id' => $base_id]);
    }

    $pdo->commit();

    echo json_encode([
        "status" => "success", 
        "orderId" => $order_id,
        "message" => "Order #$order_id successfully synchronized with the fleet."
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
