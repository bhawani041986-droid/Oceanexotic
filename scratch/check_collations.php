<?php
require 'db.php';
$stmt = $pdo->query('SHOW FULL COLUMNS FROM todays_catch');
echo "todays_catch:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt = $pdo->query('SHOW FULL COLUMNS FROM products');
echo "\nproducts:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
