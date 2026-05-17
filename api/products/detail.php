<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db.php';

$id = isset($_GET['id']) ? $_GET['id'] : '';

if (!$id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Product ID required']);
    exit;
}

try {
    // Fetch product details joined with today's catch for live pricing/stock
    $stmt = $pdo->prepare("
        SELECT 
            p.*,
            s.name as seller_name,
            tc.price_per_kg as live_price,
            tc.remaining_kg as live_stock,
            tc.harbor_node as live_harbor,
            tc.batch_label,
            tc.freshness_timestamp,
            tc.status as catch_status
        FROM products p
        LEFT JOIN sellers s ON p.seller_id = s.id COLLATE utf8mb4_unicode_ci
        LEFT JOIN todays_catch tc ON p.id = tc.product_id COLLATE utf8mb4_unicode_ci
            AND tc.catch_date = CURDATE()
            AND tc.status != 'ARCHIVED'
        WHERE p.id = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Product not found in registry']);
        exit;
    }

    // Map database fields to the frontend expected structure
    $response = [
        "id" => $product['id'],
        "name" => $product['name'],
        "tagline" => $product['category'] . " - " . ($product['live_harbor'] ?? $product['harbor_node']),
        "price" => (float)($product['live_price'] ?? $product['price']),
        "originalPrice" => (float)($product['live_price'] ?? $product['price']) * 1.2, // Demo mock
        "unit" => $product['unit'] ?? 'kg',
        "description" => $product['description'],
        "sellerName" => $product['seller_name'] ?? 'OceanExotic Seller',
        "sellerId" => $product['seller_id'],
        "origin" => $product['live_harbor'] ?? $product['harbor_node'],
        "stock" => (float)($product['live_stock'] ?? $product['stock'] ?? 0),
        "images" => $product['image_url'] ? [$product['image_url']] : [],
        "gallery" => $product['gallery'] ? json_decode($product['gallery']) : [],
        "badge" => $product['catch_status'] ?? 'FRESH CATCH',
        "rating" => 4.8, // Mocked for now
        "reviews" => 12, // Mocked for now
        "freshness" => 100,
        "nutrition" => $product['nutrition'] ? json_decode($product['nutrition'], true) : [
            "protein" => "20g",
            "omega3" => "300mg",
            "calories" => "100 kcal",
            "fat" => "2g"
        ],
        "features" => [
            ["label" => "Harbor Node", "value" => $product['live_harbor'] ?? $product['harbor_node']],
            ["label" => "Catch Batch", "value" => $product['batch_label'] ?? 'MORNING'],
            ["label" => "Freshness", "value" => "Verified Live"]
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registry retrieval failed: ' . $e->getMessage()]);
}
?>
