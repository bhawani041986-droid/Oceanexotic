<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $pdo->exec("TRUNCATE TABLE reviews");
    echo "Review Registry Purged Successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
