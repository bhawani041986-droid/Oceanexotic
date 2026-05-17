<?php
require_once __DIR__ . '/../db.php';
$pdo = getDB();

echo "--- testing user_addresses query ---\n";
try {
    $stmt = $pdo->prepare("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC");
    $stmt->execute(['1']);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Count: " . count($rows) . "\n";
    print_r($rows);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "--- testing profile query ---\n";
try {
    $stmt = $pdo->prepare('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?');
    $stmt->execute(['1']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    print_r($user);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "--- testing customer_history query ---\n";
try {
    $sql = "SELECT 
                o.id, 
                o.created_at as date, 
                o.total_amount as total, 
                o.status,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
            FROM orders o
            WHERE o.user_id = :user_id 
            ORDER BY o.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => '1']);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Count: " . count($orders) . "\n";
    print_r($orders);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
