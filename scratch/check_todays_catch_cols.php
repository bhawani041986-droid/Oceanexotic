<?php
require 'db.php';
$stmt = $pdo->query('SHOW FULL COLUMNS FROM todays_catch');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
