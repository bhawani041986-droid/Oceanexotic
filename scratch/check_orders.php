<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT id, user_id, total_amount, status FROM orders ORDER BY id DESC LIMIT 20');
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "Order ID: " . $row['id'] . " | User ID: " . $row['user_id'] . " | Total: " . $row['total_amount'] . " | Status: " . $row['status'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
