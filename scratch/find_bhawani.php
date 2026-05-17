<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute(['bhawani@oceanfresh.com']);
echo json_encode($stmt->fetch());
?>
