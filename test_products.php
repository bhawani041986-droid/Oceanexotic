<?php
require 'db.php';
$pdo = getDB();
$s = $pdo->query("SELECT id, name, category, image_url FROM products WHERE id IN ('PRD-3001', 'PRD-3002')");
print_r($s->fetchAll(PDO::FETCH_ASSOC));
