<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT id, name, email, role FROM users LIMIT 20');
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . " | Name: " . $row['name'] . " | Email: " . $row['email'] . " | Role: " . $row['role'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
