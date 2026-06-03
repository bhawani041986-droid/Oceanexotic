<?php
require_once 'db.php';
try {
    $stmt = $pdo->query("SHOW TRIGGERS LIKE 'users'");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
