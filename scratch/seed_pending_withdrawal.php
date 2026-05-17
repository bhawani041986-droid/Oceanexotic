<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $pdo->exec("INSERT INTO seller_withdrawals (seller_id, amount, bank_node, status) VALUES ('SEL-001', 15000.00, 'Oceanic Reserve Node', 'PENDING')");
    echo "Pending withdrawal inserted successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
