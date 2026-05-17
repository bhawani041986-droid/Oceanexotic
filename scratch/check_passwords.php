<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT email, password FROM users LIMIT 5');
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "Email: " . $row['email'] . " | Password: " . $row['password'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
