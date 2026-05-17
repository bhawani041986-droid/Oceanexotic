<?php
header("Content-Type: application/json");
require_once 'db.php';
$pdo = getDB();
$s = $pdo->query('SELECT * FROM users');
echo json_encode($s->fetchAll());
?>
