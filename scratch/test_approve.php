<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare("UPDATE reviews SET status = 'APPROVED' WHERE id = 1");
    $stmt->execute();
    echo "TEST REVIEW APPROVED.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
