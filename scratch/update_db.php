<?php
require_once 'db.php';
try {
    $pdo = getDB();
    // Add seller_response if it doesn't exist
    $pdo->exec("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS seller_response TEXT DEFAULT NULL AFTER comment");
    $pdo->exec("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP NULL DEFAULT NULL AFTER seller_response");
    echo "Reviews table upgraded successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
