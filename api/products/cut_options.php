<?php
/**
 * GET /api/products/cut_options.php?product_id=surmai-seer-fish
 * Returns all cut options for a product with dynamic pricing.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once '../../db.php';

$product_id = $_GET['product_id'] ?? '';
if (!$product_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'product_id required']);
    exit;
}

try {
    // Get base price from today's catch (live price) or product table
    $priceStmt = $pdo->prepare("
        SELECT COALESCE(tc.price_per_kg, p.price) AS base_price
        FROM products p
        LEFT JOIN todays_catch tc ON tc.product_id = p.id
            AND tc.catch_date = CURDATE()
            AND tc.status != 'ARCHIVED'
        WHERE p.id = ?
        ORDER BY tc.freshness_timestamp DESC
        LIMIT 1
    ");
    $priceStmt->execute([$product_id]);
    $base = $priceStmt->fetch(PDO::FETCH_ASSOC);
    $basePrice = $base ? (float)$base['base_price'] : 0;

    $area = isset($_GET['area']) ? trim($_GET['area']) : '';
    if ($area) {
        $ovStmt = $pdo->prepare("SELECT price FROM product_location_overrides WHERE product_id = ? AND territory_name = ? AND price IS NOT NULL");
        $ovStmt->execute([$product_id, $area]);
        $override = $ovStmt->fetch(PDO::FETCH_ASSOC);
        if ($override) {
            $basePrice = (float)$override['price'];
        }
    }

    // Get cut options
    $cutsStmt = $pdo->prepare("
        SELECT
            pco.id,
            pco.cut_type,
            pco.price_modifier_percent,
            pco.price_flat_add,
            pco.is_available,
            pco.stock_kg,
            pco.sort_order,
            -- Compute final price
            ROUND(
                ? * (1 + pco.price_modifier_percent / 100) + pco.price_flat_add,
                0
            ) AS final_price
        FROM product_cut_options pco
        WHERE pco.product_id = ?
        ORDER BY pco.sort_order ASC
    ");
    $cutsStmt->execute([$basePrice, $product_id]);
    $cuts = $cutsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Humanize cut_type labels
    $labels = [
        'WHOLE'      => ['label' => 'Whole Fish',    'desc' => 'Full fish, as caught',          'icon' => '🐟'],
        'CURRY_CUT'  => ['label' => 'Curry Cut',     'desc' => 'Pieces ready for curry',        'icon' => '🍛'],
        'STEAK_CUT'  => ['label' => 'Steak Cut',     'desc' => 'Thick cross-section steaks',    'icon' => '🥩'],
        'FILLET'     => ['label' => 'Fillet',        'desc' => 'Boneless, skin-on slabs',       'icon' => '🍽️'],
        'CLEANED'    => ['label' => 'Cleaned',       'desc' => 'Gutted & scaled, ready to cook','icon' => '✨'],
        'UNCLEANED'  => ['label' => 'Uncleaned',     'desc' => 'As-is from harbor',             'icon' => '🌊'],
        'HEAD_ON'    => ['label' => 'Head On',       'desc' => 'Full head retained',            'icon' => '🐠'],
        'HEAD_OFF'   => ['label' => 'Head Off',      'desc' => 'Head removed',                  'icon' => '✂️'],
        'SKIN_ON'    => ['label' => 'Skin On',       'desc' => 'Natural skin retained',         'icon' => '🔵'],
        'SKIN_OFF'   => ['label' => 'Skin Off',      'desc' => 'Skin removed for easy cooking', 'icon' => '⚪'],
    ];

    $enriched = array_map(function($cut) use ($labels) {
        $meta = $labels[$cut['cut_type']] ?? ['label' => $cut['cut_type'], 'desc' => '', 'icon' => '🐟'];
        return array_merge($cut, $meta, [
            'is_available' => (bool)$cut['is_available'],
            'final_price'  => (float)$cut['final_price'],
            'price_modifier_percent' => (float)$cut['price_modifier_percent'],
            'price_flat_add' => (float)$cut['price_flat_add'],
        ]);
    }, $cuts);

    echo json_encode([
        'status'      => 'success',
        'product_id'  => $product_id,
        'base_price'  => $basePrice,
        'cut_options' => $enriched,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Cut registry failure']);
}
