<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->query("DESCRIBE orders");
echo json_encode($stmt->fetchAll());
?>
