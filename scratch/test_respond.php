<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare("UPDATE reviews SET seller_response = 'Thank you for the positive signal, Admiral! We strive for optimal cold-chain preservation.', responded_at = CURRENT_TIMESTAMP WHERE id = 1");
    $stmt->execute();
    echo "SELLER RESPONSE REGISTERED.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
