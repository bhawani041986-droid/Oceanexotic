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

    // Verify all products/addons exist in the registry (stale cart check)
    $product_check_stmt = $pdo->prepare("SELECT id FROM products WHERE id = :id");
    $addon_check_stmt = $pdo->prepare("SELECT id FROM addons WHERE id = :id AND is_active = 1");
    $item_base_ids = [];
    $item_is_addon = [];

    foreach ($data['items'] as $item) {
        $base_id = $item['id'];
        $is_addon = (strpos($base_id, 'ADD-') === 0);
        $item_is_addon[$item['id']] = $is_addon;

        if ($is_addon) {
            $addon_check_stmt->execute(['id' => $base_id]);
            if (!$addon_check_stmt->fetch()) {
                throw new Exception("The add-on '" . $item['name'] . "' (ID: " . $item['id'] . ") is no longer available. Please return to the market and refresh your cargo.");
            }
        } else {
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
        }
        $item_base_ids[$item['id']] = $base_id;
    }

    // Fetch order window settings
    $settings = [];
    try {
        $set_stmt = $pdo->query("SELECT setting_key, setting_value FROM marketplace_settings WHERE setting_key IN ('ordersEnabled', 'ordersOpenTime', 'ordersCloseTime')");
        while ($row = $set_stmt->fetch()) {
            $settings[$row['setting_key']] = json_decode($row['setting_value'], true);
        }
    } catch (PDOException $se) {
        // Table or columns might be missing/unseeded in a clean setup; fallback to defaults
    }

    $ordersEnabled = isset($settings['ordersEnabled']) ? (bool)$settings['ordersEnabled'] : true;
    $ordersOpenTime = $settings['ordersOpenTime'] ?? '09:00';
    $ordersCloseTime = $settings['ordersCloseTime'] ?? '22:00';

    // Verify time window
    $currentTime = date('H:i');
    $isOutsideWindow = false;
    
    if ($ordersOpenTime && $ordersCloseTime) {
        if ($ordersOpenTime < $ordersCloseTime) {
            // normal window, e.g. 09:00 to 22:00
            if ($currentTime < $ordersOpenTime || $currentTime > $ordersCloseTime) {
                $isOutsideWindow = true;
            }
        } else {
            // overnight window, e.g. 22:00 to 09:00 next day
            if ($currentTime < $ordersOpenTime && $currentTime > $ordersCloseTime) {
                $isOutsideWindow = true;
            }
        }
    }

    // Determine if this order is forced to be a pre-order
    $is_pre_order = 0;
    if (!$ordersEnabled || $isOutsideWindow || (isset($data['isPreOrder']) && $data['isPreOrder'] == 1)) {
        $is_pre_order = 1;
    }

    $pdo->beginTransaction();

    // 1. Create Order record
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status, delivery_address, payment_method, is_pre_order) 
                           VALUES (:user_id, :total_amount, 'PENDING', :address, :payment, :is_pre_order)");
    
    $user_id = $data['userId'] ?? 'GUEST-' . time();
    $total = $data['total'];
    $address = $data['address'] ?? 'Default Address';
    $payment = $data['paymentMethod'] ?? 'COD';

    $stmt->execute([
        'user_id' => $user_id,
        'total_amount' => $total,
        'address' => $address,
        'payment' => $payment,
        'is_pre_order' => $is_pre_order
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

        // 3. Deduct stock for products only (bypass for addons)
        if (!($item_is_addon[$item['id']] ?? false)) {
            $update_stmt = $pdo->prepare("UPDATE products SET stock = stock - :qty WHERE id = :id");
            $update_stmt->execute(['qty' => $item['quantity'], 'id' => $base_id]);
        }
    }

    $pdo->commit();

    echo json_encode([
        "status" => "success", 
        "orderId" => $order_id,
        "isPreOrder" => $is_pre_order,
        "message" => $is_pre_order ? "Pre-order #$order_id successfully queued for the next open slot!" : "Order #$order_id successfully synchronized with the fleet."
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
