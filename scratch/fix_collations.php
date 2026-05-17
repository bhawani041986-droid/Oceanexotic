<?php
require 'db.php';
try {
    $pdo->exec('ALTER TABLE todays_catch CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('ALTER TABLE sellers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    echo "Success: All tables converted to utf8mb4_unicode_ci";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
