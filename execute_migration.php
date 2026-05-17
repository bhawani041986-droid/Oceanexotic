<?php
require_once 'db.php';

try {
    $pdo = getDB();
    $sql = file_get_contents('database/live_marketplace_migration.sql');
    
    // Split SQL by semicolon, but handle potential issues with semicolons in strings or comments
    // A better way is to execute it in chunks or use a tool that handles multiple statements.
    // PDO::exec can usually only execute one statement at a time in some configurations.
    // However, some PDO drivers allow multiple statements if configured.
    
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, 0);
    $pdo->exec($sql);
    
    echo json_encode(["status" => "success", "message" => "Migration executed successfully"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
