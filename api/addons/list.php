<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Fetch all active addons
    $stmt = $pdo->query("SELECT * FROM addons WHERE is_active = 1 ORDER BY id ASC");
    $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Current local time
    $currentTime = date('H:i:s');
    
    // Requested area (delivery zone/jetty)
    $area = isset($_GET['area']) ? trim($_GET['area']) : '';

    $filtered = [];
    foreach ($addons as $addon) {
        $start = $addon['start_time'] ?: '00:00:00';
        $end = $addon['end_time'] ?: '23:59:59';
        $timeMatch = false;

        if ($start <= $end) {
            if ($currentTime >= $start && $currentTime <= $end) {
                $timeMatch = true;
            }
        } else {
            // Handles overnight slots e.g. 22:00:00 to 06:00:00
            if ($currentTime >= $start || $currentTime <= $end) {
                $timeMatch = true;
            }
        }

        if (!$timeMatch) {
            continue;
        }

        // Area filter: if allowed_areas is not null/empty, check if current area matches
        if ($addon['allowed_areas'] !== null && trim($addon['allowed_areas']) !== '') {
            $allowed = array_map('trim', explode(',', $addon['allowed_areas']));
            // If the user's area is not specified, or it does not match one of the allowed areas, filter it out
            if (!$area || !in_array($area, $allowed, true)) {
                continue;
            }
        }

        $addon['price'] = (float)$addon['price'];
        $addon['is_active'] = (int)$addon['is_active'];
        $filtered[] = $addon;
    }

    echo json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
