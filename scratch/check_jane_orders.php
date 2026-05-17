<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = "USR-1778761853698"');
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($orders) . " orders for Jane Smith.\n";
    print_r($orders);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
