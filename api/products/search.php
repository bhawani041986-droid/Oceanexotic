<?php
/**
 * GET /api/products/search.php?q=tuna&category=Shellfish
 * Performs a real-time query across the product registry and live harbor stock.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once '../../db.php';

$query = $_GET['q'] ?? '';
$category = $_GET['category'] ?? '';
$sort = $_GET['sort'] ?? 'popular';

try {
    $sql = "
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price as base_price,
            p.category,
            p.image_url,
            p.rating,
            -- Live status check
            tc.id as catch_id,
            tc.harbor_node,
            tc.price_per_kg as live_price,
            tc.remaining_kg,
            tc.batch_label,
            tc.status as live_status,
            tc.catch_date,
            s.name as seller_name
        FROM products p
        LEFT JOIN todays_catch tc ON tc.product_id = p.id 
            AND tc.catch_date = CURDATE()
            AND tc.status != 'ARCHIVED'
        LEFT JOIN sellers s ON s.id = p.seller_id
        WHERE 1=1
    ";

    $params = [];

    if ($query) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%$query%";
        $params[] = "%$query%";
    }

    if ($category && $category !== 'All Seafood') {
        $sql .= " AND p.category = ?";
        $params[] = $category;
    }

    if ($sort === 'price_low') {
        $sql .= " ORDER BY COALESCE(tc.price_per_kg, p.price) ASC";
    } elseif ($sort === 'price_high') {
        $sql .= " ORDER BY COALESCE(tc.price_per_kg, p.price) DESC";
    } else {
        $sql .= " ORDER BY p.rating DESC, p.created_at DESC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format for frontend
    $formatted = array_map(function($row) {
        $isLive = !empty($row['catch_id']);
        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'category' => $row['category'],
            'price' => $isLive ? (float)$row['live_price'] : (float)$row['base_price'],
            'image' => $row['image_url'],
            'rating' => (float)$row['rating'],
            'seller' => $row['seller_name'] ?? 'Verified Fleet',
            'is_live' => $isLive,
            'harbor' => $row['harbor_node'],
            'stock' => $isLive ? (float)$row['remaining_kg'] : null,
            'batch' => $row['batch_label'],
            'status' => $isLive ? $row['live_status'] : 'AVAILABLE',
            'tag' => $isLive ? 'LIVE BATCH' : 'FRESH CATCH'
        ];
    }, $results);

    echo json_encode([
        'status' => 'success',
        'query' => $query,
        'results' => $formatted,
        'total' => count($formatted),
        'server_time' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registry search failure']);
}
