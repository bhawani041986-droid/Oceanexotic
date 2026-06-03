<?php
require_once 'db.php';
$pdo = getDB();
$s = $pdo->query('SELECT id, user_id, total_amount, status, delivery_address FROM orders');
print_r($s->fetchAll(PDO::FETCH_ASSOC));
