<?php
require_once 'db.php';
try {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "TABLES:\n"; print_r($tables);
    echo "\n--- products schema ---\n";
    $r = $pdo->query("DESCRIBE products")->fetchAll(PDO::FETCH_ASSOC);
    foreach($r as $col) echo $col['Field']." | ".$col['Type']."\n";
} catch(Exception $e) { echo "ERR: ".$e->getMessage(); }
?>
