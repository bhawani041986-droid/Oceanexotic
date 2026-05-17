<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = "USR-1778761853251"');
    $stmt->execute();
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
