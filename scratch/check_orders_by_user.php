<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->query("SELECT user_id, COUNT(*) as count FROM orders GROUP BY user_id");
echo json_encode($stmt->fetchAll());
?>
