<?php
require 'db.php';
$pdo = getDB();
$s = $pdo->query('SELECT * FROM todays_catch');
print_r($s->fetchAll(PDO::FETCH_ASSOC));
