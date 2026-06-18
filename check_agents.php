<?php
require_once 'db.php';
$stmt = $pdo->query("SELECT email, password, role FROM users WHERE role = 'AGENT' LIMIT 5");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($users);
?>
