<?php
require 'db.php';
$stmt = $pdo->query('SELECT id FROM products');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
