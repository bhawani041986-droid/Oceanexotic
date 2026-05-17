<?php
require_once '../../db.php';
header('Content-Type: application/json');

try {
    $pdo = getDB();
    $stmt = $pdo->query("DESCRIBE products");
    $products_cols = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("DESCRIBE todays_catch");
    $catch_cols = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("DESCRIBE product_cut_options");
    $cut_cols = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'products' => $products_cols,
        'todays_catch' => $catch_cols,
        'product_cut_options' => $cut_cols
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
