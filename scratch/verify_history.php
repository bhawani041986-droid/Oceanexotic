<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE user_id = 'USR-123'");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
