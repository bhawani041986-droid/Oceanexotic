<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->prepare('UPDATE users SET role = "ADMIN" WHERE email = "bhawani@oceanfresh.com"');
    $stmt->execute();
    echo "Updated Bhawani's role to ADMIN.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
