<?php
require_once 'db.php';
$pdo = getDB();

echo "=== PRODUCTS SCHEMA ===\n";
$s = $pdo->query('DESCRIBE products');
print_r($s->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== TODAYS_CATCH SCHEMA ===\n";
$s = $pdo->query('DESCRIBE todays_catch');
print_r($s->fetchAll(PDO::FETCH_ASSOC));
?>
