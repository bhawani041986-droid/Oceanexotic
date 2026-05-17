<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->query("SHOW TABLES LIKE 'order_items'");
echo $stmt->fetch() ? "Exists" : "Missing";
?>
