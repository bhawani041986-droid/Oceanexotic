<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Authorized."]);
    exit;
}

try {
    $pdo = getDB();
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['name'], $data['zone_type'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Territory manifest incomplete."]);
        exit;
    }

    $pdo->beginTransaction();

    // 1. Insert into the main tree for UI hierarchy
    $stmt = $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, coordinates, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'],
        $data['zone_type'],
        $data['parent_id'] ?? null,
        $data['coordinates'] ?? null,
        $data['status'] ?? 'ACTIVE'
    ]);
    
    $nodeId = $pdo->lastInsertId();

    // 2. Insert into Specific Business Architecture Tables
    if ($data['zone_type'] === 'ADMIN_HUB') {
        $stmtHub = $pdo->prepare("INSERT INTO global_admin_hubs (id, name, hub_code, parent_city_id, manager_name, rider_capacity) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtHub->execute([
            $nodeId,
            $data['name'],
            $data['hub_code'] ?? uniqid('HUB-'),
            $data['parent_id'] ?? null,
            $data['manager_name'] ?? null,
            $data['rider_capacity'] ?? 0
        ]);
    } else if ($data['zone_type'] === 'DELIVERY_TERRITORY') {
        $stmtTerr = $pdo->prepare("INSERT INTO global_business_territories (id, hub_id, name) VALUES (?, ?, ?)");
        $stmtTerr->execute([
            $nodeId,
            $data['parent_id'] ?? null,
            $data['name']
        ]);
    } else if ($data['zone_type'] === 'DELIVERY_ZONE') {
        $stmtZone = $pdo->prepare("INSERT INTO global_delivery_zones (id, territory_id, name, polygon_gps_data, delivery_charge, minimum_order, eta_mins) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmtZone->execute([
            $nodeId,
            $data['parent_id'] ?? null,
            $data['name'],
            $data['coordinates'] ?? null,
            $data['delivery_charge'] ?? 0,
            $data['minimum_order'] ?? 0,
            $data['eta_mins'] ?? 30
        ]);
    }

    $pdo->commit();

    echo json_encode([
        "status" => "success", 
        "message" => "Global Node Commissioned.",
        "id" => $nodeId
    ]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
