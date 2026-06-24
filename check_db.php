<?php
require 'db.php';
$stmt = $pdo->query('SHOW TABLES');
echo "TABLES:\n";
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo "- " . $row[0] . "\n";
}

try {
  echo "\nRECIPES TABLE SCHEMA:\n";
  $stmt2 = $pdo->query('SHOW CREATE TABLE recipes');
  if ($stmt2) {
    $row2 = $stmt2->fetch(PDO::FETCH_NUM);
    echo $row2[1] . "\n";
  }
} catch (Exception $e) {}

echo "\nREVIEWS TABLE SCHEMA:\n";
$stmt4 = $pdo->query('SHOW CREATE TABLE reviews');
$row4 = $stmt4->fetch(PDO::FETCH_NUM);
echo $row4[1] . "\n";
echo $row3[1] . "\n";
