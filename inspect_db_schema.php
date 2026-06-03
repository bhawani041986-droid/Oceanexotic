<?php
require 'db.php';

echo "=== PRODUCTS TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE products');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== TODAYS_CATCH TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE todays_catch');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== PRODUCT_CUT_OPTIONS TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE product_cut_options');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== PRODUCT_LOCATION_OVERRIDES TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE product_location_overrides');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== PRODUCT_PREP_OPTIONS TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE product_prep_options');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== SELLERS TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE sellers');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== SAMPLE PRODUCT DATA ===\n\n";
$stmt = $pdo->query('SELECT * FROM products LIMIT 1');
$product = $stmt->fetch();
if ($product) {
    foreach ($product as $key => $value) {
        echo $key . ': ' . var_export($value, true) . "\n";
    }
} else {
    echo "No products found\n";
}
?>
