<?php
require_once 'db.php';
$pdo = getDB();

echo "=== TABLE: maritime_territories ===\n";
$s = $pdo->query("DESCRIBE maritime_territories");
foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo "{$row['Field']} - {$row['Type']} - Null: {$row['Null']} - Key: {$row['Key']} - Default: {$row['Default']}\n";
}

echo "\n=== DATA: maritime_territories ===\n";
$s = $pdo->query("SELECT * FROM maritime_territories");
print_r($s->fetchAll(PDO::FETCH_ASSOC));
?>




