<?php
require_once __DIR__ . '/../db.php';
$pdo = getDB();

try {
    $stmt = $pdo->query("SELECT id, name FROM products");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
