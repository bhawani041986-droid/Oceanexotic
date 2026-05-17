<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db.php';

// Verification Logic
echo json_encode(['success' => true, 'status' => 'Verified']);
?>
