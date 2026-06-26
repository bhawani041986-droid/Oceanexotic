<?php
require_once __DIR__ . '/../db.php';
try {
    $pdo = getDB();
    // check if is_featured column exists
    $columns = $pdo->query("SHOW COLUMNS FROM products LIKE 'is_featured'")->fetchAll();
    if (empty($columns)) {
        $pdo->exec("ALTER TABLE products ADD COLUMN is_featured TINYINT(1) DEFAULT 0");
        echo "SUCCESS: is_featured column added to local MySQL products table.\n";
    } else {
        echo "INFO: is_featured column already exists in local MySQL products table.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
