<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $data = [
        'product_id' => 'p1',
        'product_name' => 'Premium Bluefin Tuna',
        'seller_id' => '4',
        'user_id' => 'USR-123',
        'user_name' => 'Bhawani Singh',
        'rating' => 5,
        'comment' => 'Testing the hardened maritime registry. Freshness is optimal.',
        'order_id' => 9982,
        'status' => 'PENDING'
    ];
    
    $stmt = $pdo->prepare("INSERT INTO reviews (product_id, product_name, seller_id, user_id, user_name, rating, comment, order_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['product_id'],
        $data['product_name'],
        $data['seller_id'],
        $data['user_id'],
        $data['user_name'],
        $data['rating'],
        $data['comment'],
        $data['order_id'],
        $data['status']
    ]);
    
    echo "TEST REVIEW INSERTED. ID: " . $pdo->lastInsertId();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
