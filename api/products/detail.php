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
        LEFT JOIN sellers s ON p.seller_id = s.id
        LEFT JOIN todays_catch tc ON p.id = tc.product_id
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

    $area = isset($_GET['area']) ? trim($_GET['area']) : '';

    $price = (float)($product['live_price'] ?? $product['price']);
    $stock = (float)($product['live_stock'] ?? $product['stock'] ?? 0);
    $status = $product['catch_status'] ?? 'FRESH CATCH';
    $is_visible = true;
    $availability = $stock > 0 ? "In Stock" : "Out of Stock";

    if ($area) {
        // Query location overrides
        $ovStmt = $pdo->prepare("SELECT * FROM product_location_overrides WHERE product_id = ? AND territory_name = ?");
        $ovStmt->execute([$id, $area]);
        $override = $ovStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($override) {
            if ($override['price'] !== null) {
                $price = (float)$override['price'];
            }
            if ($override['stock'] !== null) {
                $stock = (float)$override['stock'];
                $availability = $stock > 0 ? "In Stock" : "Out of Stock";
            }
            if ($override['is_visible'] !== null) {
                $is_visible = (bool)$override['is_visible'];
            }
            if ($override['status'] !== null) {
                if ($override['status'] === 'COMING_SOON') {
                    $status = 'COMING SOON';
                    $availability = 'Coming Soon';
                    $stock = 0.0;
                } else if ($override['status'] === 'OUT_OF_STOCK') {
                    $status = 'OUT OF STOCK';
                    $availability = 'Out of Stock';
                    $stock = 0.0;
                } else if ($override['status'] === 'ACTIVE') {
                    $status = 'ACTIVE';
                    $availability = $stock > 0 ? 'In Stock' : 'Out of Stock';
                }
            }
        }
    }

    if (!$is_visible) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Product not available in this sector']);
        exit;
    }

    // Fetch preparation options
    $prepStmt = $pdo->prepare("SELECT * FROM product_prep_options WHERE product_id = ? AND is_available = 1 ORDER BY sort_order ASC");
    $prepStmt->execute([$id]);
    $prepOptions = $prepStmt->fetchAll(PDO::FETCH_ASSOC);
    $prep_options = array_map(function($po) {
        return [
            'id' => $po['id'],
            'prep_type' => $po['prep_type'],
            'name' => $po['name'],
            'price_flat_add' => (float)$po['price_flat_add'],
            'is_available' => (bool)$po['is_available']
        ];
    }, $prepOptions);

    // Fetch location-filtered active addons
    $addonsStmt = $pdo->query("SELECT * FROM addons WHERE is_active = 1 ORDER BY id ASC");
    $allAddons = $addonsStmt->fetchAll(PDO::FETCH_ASSOC);
    $currentTime = date('H:i:s');
    $filteredAddons = [];
    foreach ($allAddons as $addon) {
        $start = $addon['start_time'] ?: '00:00:00';
        $end = $addon['end_time'] ?: '23:59:59';
        $timeMatch = ($start <= $end) 
            ? ($currentTime >= $start && $currentTime <= $end)
            : ($currentTime >= $start || $currentTime <= $end);
            
        if (!$timeMatch) continue;
        
        if ($addon['allowed_areas'] !== null && trim($addon['allowed_areas']) !== '') {
            $allowed = array_map('trim', explode(',', $addon['allowed_areas']));
            if (!$area || !in_array($area, $allowed, true)) {
                continue;
            }
        }
        $addon['price'] = (float)$addon['price'];
        $addon['is_active'] = (int)$addon['is_active'];
        $filteredAddons[] = $addon;
    }

    // Map database fields to the frontend expected structure
    $response = [
        "id" => $product['id'],
        "name" => $product['name'],
        "tagline" => $product['category'] . " - " . ($product['live_harbor'] ?? $product['harbor_node']),
        "price" => $price,
        "originalPrice" => round($price * (100/85), 2), // 15% discount mock
        "discount_percent" => 15,
        "unit" => $product['unit'] ?? 'kg',
        "description" => $product['description'],
        "sellerName" => $product['seller_name'] ?? 'OceanExotic Seller',
        "seller_name" => $product['seller_name'] ?? 'OceanExotic Seller',
        "sellerId" => $product['seller_id'],
        "seller_id" => $product['seller_id'],
        "origin" => $product['live_harbor'] ?? $product['harbor_node'],
        "stock" => $stock,
        "availability" => $availability,
        "image_url" => $product['image_url'],
        "images" => $product['image_url'] ? [$product['image_url']] : [],
        "gallery" => $product['gallery'] ? json_decode($product['gallery']) : [],
        "badge" => $status,
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
        ],
        "prep_options" => $prep_options,
        "addons" => $filteredAddons
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registry retrieval failed: ' . $e->getMessage()]);
}
?>
