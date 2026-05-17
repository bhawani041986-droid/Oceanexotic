<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
echo json_encode($stmt->fetchAll());
?>
