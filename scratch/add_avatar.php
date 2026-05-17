<?php
require_once __DIR__ . '/../db.php';
$pdo = getDB();

try {
    // Check if avatar_url column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'avatar_url'");
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$column) {
        echo "Adding 'avatar_url' column to 'users' table...\n";
        $pdo->exec("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL");
        echo "Successfully added 'avatar_url' column!\n";
    } else {
        echo "'avatar_url' column already exists in 'users' table.\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
