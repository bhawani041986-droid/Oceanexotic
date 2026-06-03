<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("SELECT p.*, s.name as sellerName FROM products p LEFT JOIN sellers s ON p.seller_id = s.id WHERE p.status = 'ACTIVE' ORDER BY p.created_at DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ensure the output format matches the expected frontend schema
    $formattedProducts = array_map(function($p) {
        return [
            "id" => $p['id'],
            "name" => $p['name'],
            "price" => (float)$p['price'],
            "unit" => $p['unit'] ?? "kg",
            "image" => $p['image_url'] ?? "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
            "image_url" => $p['image_url'] ?? null,
            "sellerName" => $p['sellerName'] ?? "Andaman Hub",
            "category" => $p['category'],
            "description" => $p['description'],
            "freshness" => "FRESH CATCH",
            "deliveryTime" => "12h",
            "rating" => 4.9
        ];
    }, $products);

    echo json_encode([
        "status" => "success",
        "products" => $formattedProducts
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
