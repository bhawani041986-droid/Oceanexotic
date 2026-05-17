<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM users WHERE name LIKE '%Advancevovo%'");
$stmt->execute();
$users = $stmt->fetchAll();
echo json_encode($users);
?>
