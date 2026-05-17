<?php
require 'db.php';
$pdo = getDB();
$stmt = $pdo->query("DESCRIBE products");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
