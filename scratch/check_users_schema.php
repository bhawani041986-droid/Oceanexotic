<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query('DESCRIBE users');
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
