<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $sql = "ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0";
    $pdo->exec($sql);
    echo "discount_percent column added successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
