<?php
require_once 'db.php';
$pdo = getDB();

echo "=== PRODUCTS ===\n";
$s = $pdo->query('SELECT id, name, is_live_inventory, catch_date, freshness_timestamp FROM products LIMIT 5');
print_r($s->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== TODAYS_CATCH ===\n";
$s = $pdo->query('SELECT * FROM todays_catch LIMIT 5');
print_r($s->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== PRODUCT CUT OPTIONS ===\n";
$s = $pdo->query('SELECT * FROM product_cut_options LIMIT 5');
print_r($s->fetchAll(PDO::FETCH_ASSOC));
?>
