<?php
require 'db.php';

echo "=== CHECKING PRODUCT PRD-AND-01 ===\n\n";

// Check exact ID
$stmt = $pdo->query("SELECT id, name, status FROM products WHERE id = 'PRD-AND-01'");
$product = $stmt->fetch();
if ($product) {
    echo "FOUND: " . $product['id'] . " | " . $product['name'] . " | " . $product['status'] . "\n";
} else {
    echo "NOT FOUND: PRD-AND-01\n";
}

// Check similar IDs
echo "\n=== SIMILAR PRODUCT IDs ===\n\n";
$stmt = $pdo->query("SELECT id, name, status FROM products WHERE id LIKE '%AND-01%' OR name LIKE '%Red Snapper%'");
while($row = $stmt->fetch()) {
    echo $row['id'] . " | " . $row['name'] . " | " . $row['status'] . "\n";
}

// Check if there's a variant with hyphen
echo "\n=== PRODUCTS WITH VARIANTS (hyphenated IDs) ===\n\n";
$stmt = $pdo->query("SELECT id, name, status FROM products WHERE id LIKE '%-%' LIMIT 10");
while($row = $stmt->fetch()) {
    echo $row['id'] . " | " . $row['name'] . " | " . $row['status'] . "\n";
}
?>
