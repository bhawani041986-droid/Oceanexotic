<?php
require_once 'db.php';

try {
    $pdo = getDB();
    $sql = "ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
    $pdo->exec($sql);
    echo "Column added successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
