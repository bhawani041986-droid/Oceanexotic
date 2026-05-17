<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->query("SELECT id, user_id, created_at, delivery_address FROM orders ORDER BY created_at DESC LIMIT 5");
while ($row = $stmt->fetch()) {
    echo "ID: {$row['id']} | UID: {$row['user_id']} | Date: {$row['created_at']} | Addr: {$row['delivery_address']}\n";
}
?>
