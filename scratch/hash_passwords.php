<?php
require_once 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query('SELECT id, password FROM users');
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['id'];
        $pwd = $row['password'];
        // Check if already hashed (starts with $2y$)
        if (strpos($pwd, '$2y$') !== 0) {
            $hashed = password_hash($pwd, PASSWORD_DEFAULT);
            $update = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
            $update->execute([$hashed, $id]);
            echo "Updated ID $id\n";
        }
    }
    echo "All passwords standardized in the registry.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
