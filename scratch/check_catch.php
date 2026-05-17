<?php
require 'db.php';
$stmt = $pdo->query('SELECT * FROM todays_catch');
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($data, JSON_PRETTY_PRINT);
