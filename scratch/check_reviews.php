<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT * FROM reviews");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
