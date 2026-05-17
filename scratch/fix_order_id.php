<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $pdo->exec("UPDATE reviews SET order_id = 'ORD-9982' WHERE id = 1");
    echo "Fixed Order ID with prefix.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
