<?php
require 'db.php';
try {
    $pdo = getDB();
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables in database:\n";
    print_r($tables);

    if (in_array('users', $tables)) {
        echo "\nColumns in 'users':\n";
        $stmt = $pdo->query('DESCRIBE users');
        print_r($stmt->fetchAll());
    }

    if (in_array('seller_verification_docs', $tables)) {
        echo "\nColumns in 'seller_verification_docs':\n";
        $stmt = $pdo->query('DESCRIBE seller_verification_docs');
        print_r($stmt->fetchAll());
    } else {
        echo "\n'seller_verification_docs' table MISSING\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
