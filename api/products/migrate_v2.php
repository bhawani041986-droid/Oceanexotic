<?php
require_once '../../db.php';
header('Content-Type: application/json');

try {
    $pdo = getDB();
    
    // Add missing columns to products table
    $pdo->exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition longtext");
    $pdo->exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_rank varchar(50) DEFAULT 'VERIFIED'");
    
    // Ensure todays_catch has what it needs
    // (It already seems okay based on DESCRIBE)
    
    echo json_encode(['status' => 'success', 'message' => 'Schema migration complete. Columns [nutrition, quality_rank] verified.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
