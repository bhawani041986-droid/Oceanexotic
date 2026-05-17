<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT email, role FROM users');
    $stmt->execute();
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
