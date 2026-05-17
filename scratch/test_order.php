<?php
require_once __DIR__ . '/../db.php';
$pdo = getDB();

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status, delivery_address, payment_method) 
                           VALUES (:user_id, :total_amount, 'PENDING', :address, :payment)");
    
    $user_id = '1';
    $total = 100.00;
    $address = 'Test Address, Hotel Taj Exotica, Havelock Jetty';
    $payment = 'COD';

    $stmt->execute([
        'user_id' => $user_id,
        'total_amount' => $total,
        'address' => $address,
        'payment' => $payment
    ]);

    $order_id = $pdo->lastInsertId();
    echo "Order inserted. ID: " . $order_id . "\n";

    $item_stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) 
                                VALUES (:order_id, :product_id, :quantity, :price)");
    
    $item_stmt->execute([
        'order_id' => $order_id,
        'product_id' => 1,
        'quantity' => 1,
        'price' => 100.00
    ]);
    echo "Order item inserted.\n";

    $pdo->rollBack();
    echo "Success & rolled back!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
