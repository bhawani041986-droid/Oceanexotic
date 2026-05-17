<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Clear existing Port Blair nodes for fresh refinement
    // We keep the Island (South Andaman) and the main Port Blair entry
    $stmt = $pdo->query("SELECT id FROM maritime_territories WHERE name = 'Port Blair' LIMIT 1");
    $portId = $stmt->fetchColumn();

    if (!$portId) {
        throw new Exception("Port Blair root node not found. Please run territory_init first.");
    }

    // Decommission legacy placeholder nodes under Port Blair
    $pdo->exec("DELETE FROM maritime_territories WHERE parent_id = $portId");

    // Port Blair Strategic Sector Partitioning
    $sectors = [
        // 1. NORTHERN MARITIME ZONE (Heavy Infrastructure)
        ['name' => 'Haddo Wharf', 'type' => 'JETTY', 'status' => 'ACTIVE'],
        ['name' => 'Chatham Jetty', 'type' => 'JETTY', 'status' => 'ACTIVE'],
        ['name' => 'Phoenix Bay Jetty', 'type' => 'JETTY', 'status' => 'ACTIVE'],
        
        // 2. CENTRAL HARVEST ZONE (High Seller Density)
        ['name' => 'Junglighat Fish Landing', 'type' => 'JETTY', 'status' => 'ACTIVE'],
        ['name' => 'Aberdeen Bazar', 'type' => 'WARD', 'status' => 'ACTIVE'],
        ['name' => 'Goal Ghar', 'type' => 'WARD', 'status' => 'ACTIVE'],
        ['name' => 'Prem Nagar', 'type' => 'WARD', 'status' => 'ACTIVE'],
        
        // 3. SOUTHERN LOGISTICS HUB
        ['name' => 'Dollygunj Industrial', 'type' => 'WARD', 'status' => 'ACTIVE'],
        ['name' => 'Bathu Basti Market', 'type' => 'WARD', 'status' => 'INACTIVE'], // Ready for expansion
        ['name' => 'Garacharama', 'type' => 'WARD', 'status' => 'INACTIVE'], // Ready for expansion
        
        // 4. COASTAL HARVEST PERIPHERY
        ['name' => 'Dairy Farm', 'type' => 'WARD', 'status' => 'ACTIVE'],
        ['name' => 'Sippighat', 'type' => 'WARD', 'status' => 'INACTIVE'], // Specialized backwater harvest
    ];

    $insert = $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, status) VALUES (?, ?, ?, ?)");
    
    foreach ($sectors as $sector) {
        $insert->execute([$sector['name'], $sector['type'], $portId, $sector['status']]);
    }

    echo json_encode([
        "status" => "success", 
        "message" => "Port Blair Territory Refined.",
        "partitioned_sectors" => count($sectors),
        "primary_hub" => "Junglighat Fish Landing"
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
