<?php
require_once 'db.php';
$pdo = getDB();
$stmt = $pdo->query("SELECT * FROM sellers");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
