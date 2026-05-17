<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once '../db.php';

$order_id = $_GET['order_id'] ?? '';

// --- 8-NODE MARITIME GRID DEFINITION ---
$MARITIME_NODES = [
    ["name" => "Haddo Port Hub", "lat" => 11.6844, "lng" => 92.7265],
    ["name" => "Junglighat Sector", "lat" => 11.6624, "lng" => 92.7165],
    ["name" => "Phoenix Bay Node", "lat" => 11.6744, "lng" => 92.7365],
    ["name" => "Aberdeen Bazar", "lat" => 11.6710, "lng" => 92.7410],
    ["name" => "Port Blair Center", "lat" => 11.6667, "lng" => 92.7500],
    ["name" => "Dollygunj Terminal", "lat" => 11.6450, "lng" => 92.7120],
    ["name" => "Bathu Basti Market", "lat" => 11.6350, "lng" => 92.7100],
    ["name" => "Garacharma Sector", "lat" => 11.6250, "lng" => 92.7100]
];

// Determine node based on order_id for consistency
$node_index = $order_id ? (crc32($order_id) % count($MARITIME_NODES)) : rand(0, count($MARITIME_NODES) - 1);
$active_node = $MARITIME_NODES[$node_index];

// Add deterministic drift
$drift_lat = (crc32($order_id . "lat") % 100) / 10000;
$drift_lng = (crc32($order_id . "lng") % 100) / 10000;

$current_lat = $active_node['lat'] + $drift_lat;
$current_lng = $active_node['lng'] + $drift_lng;

$status = "IN-TRANSIT";
$temp = -22.5 + (rand(-5, 5) / 10);

$response = [
    "order_id" => $order_id,
    "status" => $status,
    "agent_name" => "INS-ANDAMAN-FLEET",
    "current_temp" => $temp,
    "estimated_arrival" => "18 MINS",
    "current_lat" => $current_lat,
    "current_lng" => $current_lng,
    "active_node" => $active_node['name'],
    "logs" => [
        ["time" => "08:30 AM", "status" => "Harvest Dispatched", "location" => "Haddo Port Hub", "active" => false],
        ["time" => "09:15 AM", "status" => "Cold-Chain Verified", "location" => "Sector 7", "active" => false],
        ["time" => "10:20 AM", "status" => "Fleet Synchronization", "location" => $active_node['name'], "active" => true]
    ]
];

echo json_encode($response);
?>
