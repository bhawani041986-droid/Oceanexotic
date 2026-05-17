<?php
/**
 * GET /api/products/todays_catch.php
 * Returns today's live harbor inventory.
 * Auto-filters: only today's date, not expired, status != ARCHIVED
 * Query params: batch (MORNING|AFTERNOON|EVENING|ALL), limit, harbor
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, no-store, must-revalidate'); // LIVE data — never cache

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once '../../db.php';

try {
    $batch  = strtoupper($_GET['batch']  ?? 'ALL');
    $harbor = $_GET['harbor'] ?? null;
    $limit  = min((int)($_GET['limit'] ?? 20), 50);

    // Base query: join todays_catch with products for full product info
    $sql = "
        SELECT
            tc.id            AS catch_id,
            tc.product_id,
            tc.seller_id,
            tc.catch_date,
            tc.harbor_node,
            tc.quantity_kg,
            tc.remaining_kg,
            tc.price_per_kg,
            tc.freshness_timestamp,
            tc.expires_at,
            tc.batch_label,
            tc.status        AS catch_status,
            tc.catch_image_url,
            tc.notes,
            -- Freshness calculation (minutes since catch)
            TIMESTAMPDIFF(MINUTE, tc.freshness_timestamp, NOW()) AS minutes_since_catch,
            -- Percent remaining
            ROUND((tc.remaining_kg / tc.quantity_kg) * 100) AS stock_percent,
            -- Product details
            p.name,
            p.category,
            p.description,
            p.image_url,
            p.gallery,
            p.unit,
            -- Seller details
            s.name           AS seller_name
        FROM todays_catch tc
        JOIN products p ON p.id = tc.product_id
        LEFT JOIN sellers s ON s.id = tc.seller_id
        WHERE
            tc.catch_date = CURDATE()
            AND tc.expires_at > NOW()
            AND tc.status != 'ARCHIVED'
            AND tc.remaining_kg > 0
    ";

    $params = [];

    if ($batch !== 'ALL') {
        $sql .= " AND tc.batch_label = ?";
        $params[] = $batch;
    }

    if ($harbor) {
        $sql .= " AND tc.harbor_node LIKE ?";
        $params[] = "%{$harbor}%";
    }

    $sql .= " ORDER BY tc.batch_label ASC, tc.freshness_timestamp DESC LIMIT ?";
    $params[] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enrich with freshness label
    $result = array_map(function($row) {
        $mins = (int)$row['minutes_since_catch'];
        $row['freshness_label'] = match(true) {
            $mins < 60  => 'JUST ARRIVED',
            $mins < 180 => 'SUPER FRESH',
            $mins < 360 => 'FRESH TODAY',
            default     => 'SAME DAY CATCH',
        };
        $row['freshness_pct'] = max(0, 100 - (int)($mins / 14.4)); // 0-100 over 24h
        // Parse gallery JSON if present
        $row['gallery'] = $row['gallery'] ? json_decode($row['gallery'], true) : [];
        return $row;
    }, $rows);

    // Group by batch
    $grouped = [
        'MORNING'   => [],
        'AFTERNOON' => [],
        'EVENING'   => [],
    ];
    foreach ($result as $item) {
        $label = $item['batch_label'] ?? 'MORNING';
        $grouped[$label][] = $item;
    }

    echo json_encode([
        'status'        => 'success',
        'catch_date'    => date('Y-m-d'),
        'generated_at'  => date('c'),
        'total'         => count($result),
        'items'         => $result,
        'by_batch'      => $grouped,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registry handshake failure. Check harbor sync logs.']);
}
