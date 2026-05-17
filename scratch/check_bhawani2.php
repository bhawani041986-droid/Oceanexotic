<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = "bhawani041986@gmail.com"');
    $stmt->execute();
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
