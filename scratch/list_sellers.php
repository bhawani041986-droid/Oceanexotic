<?php
require 'db.php';
$stmt = $pdo->query('SELECT id FROM sellers');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
