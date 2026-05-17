<?php
header("Content-Type: application/json");
require_once 'db.php';
$pdo = getDB();
$s = $pdo->query('SELECT * FROM products');
echo json_encode($s->fetchAll());
?>
