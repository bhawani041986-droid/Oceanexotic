<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Create Maritime Territories Table
    $pdo->exec("DROP TABLE IF EXISTS maritime_territories");
    $pdo->exec("CREATE TABLE maritime_territories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        zone_type ENUM('ISLAND', 'PORT', 'JETTY', 'WARD') NOT NULL,
        parent_id INT NULL,
        coordinates VARCHAR(100) NULL,
        status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (parent_id),
        INDEX (status)
    )");

    // Seed Initial Port Blair Infrastructure
    $stmt = $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id) VALUES (?, ?, ?)");
    
    // 1. Root Island
    $stmt->execute(['South Andaman', 'ISLAND', null]);
    $islandId = $pdo->lastInsertId();
    $pdo->exec("UPDATE maritime_territories SET coordinates = '11.6234, 92.7265' WHERE id = $islandId");

    // 2. Main Port
    $stmt->execute(['Port Blair', 'PORT', $islandId]);
    $portId = $pdo->lastInsertId();
    $pdo->exec("UPDATE maritime_territories SET coordinates = '11.6667, 92.7500' WHERE id = $portId");

    // 3. Strategic Jetties & Wards
    $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, coordinates) VALUES (?, ?, ?, ?)")
        ->execute(['Phoenix Bay Jetty', 'JETTY', $portId, '11.6744, 92.7365']);
    $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, coordinates) VALUES (?, ?, ?, ?)")
        ->execute(['Junglighat Fish Landing', 'JETTY', $portId, '11.6624, 92.7165']);
    $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, coordinates) VALUES (?, ?, ?, ?)")
        ->execute(['Haddo Port', 'JETTY', $portId, '11.6844, 92.7265']);
    $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, coordinates) VALUES (?, ?, ?, ?)")
        ->execute(['Aberdeen Bazar', 'WARD', $portId, '11.6710, 92.7410']);
    $pdo->prepare("INSERT INTO maritime_territories (name, zone_type, parent_id, coordinates) VALUES (?, ?, ?, ?)")
        ->execute(['Dollygunj', 'WARD', $portId, '11.6450, 92.7120']);

    echo json_encode([
        "status" => "success", 
        "message" => "Maritime Territory Registry Initialized.",
        "nodes" => 7
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
