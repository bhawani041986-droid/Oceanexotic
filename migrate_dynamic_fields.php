<?php
require 'db.php';

try {
    // Add storage_temp column
    $pdo->exec("ALTER TABLE products ADD COLUMN storage_temp DECIMAL(4,1) DEFAULT -18.2");
    echo "Added storage_temp successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "storage_temp already exists.\n";
    } else {
        echo "Error adding storage_temp: " . $e->getMessage() . "\n";
    }
}

try {
    // Add recipes column
    $pdo->exec("ALTER TABLE products ADD COLUMN recipes LONGTEXT DEFAULT NULL");
    echo "Added recipes successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "recipes already exists.\n";
    } else {
        echo "Error adding recipes: " . $e->getMessage() . "\n";
    }
}
