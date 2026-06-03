<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../db.php';
$pdo = getDB();

$method = $_SERVER['REQUEST_METHOD'];

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

if ($method === 'POST') {
    try {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!$body) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON payload"]);
            exit();
        }

        $order_id = trim($body['order_id'] ?? '');
        $lat = floatval($body['lat'] ?? 0);
        $lng = floatval($body['lng'] ?? 0);
        $temp = floatval($body['temp'] ?? -20.0);
        $status = trim($body['status'] ?? 'IN_TRANSIT');
        $log_entry = $body['log_entry'] ?? null;
        $agent_name = trim($body['agent_name'] ?? 'INS-ANDAMAN-FLEET');

        if (empty($order_id) || $lat === 0.0 || $lng === 0.0) {
            http_response_code(400);
            echo json_encode(["error" => "Missing Telemetry Nodes: order_id, lat, lng are required"]);
            exit();
        }

        // Upsert into fleet_tracking
        $stmt = $pdo->prepare("SELECT order_id FROM fleet_tracking WHERE order_id = ?");
        $stmt->execute([$order_id]);
        $existing = $stmt->fetch();

        if ($existing) {
            $update = $pdo->prepare("
                UPDATE fleet_tracking 
                SET current_lat = ?, current_lng = ?, current_temp = ?, status = ?, last_updated = CURRENT_TIMESTAMP 
                WHERE order_id = ?
            ");
            $update->execute([$lat, $lng, $temp, $status, $order_id]);
        } else {
            $insert = $pdo->prepare("
                INSERT INTO fleet_tracking (order_id, agent_id, agent_name, current_lat, current_lng, current_temp, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $insert->execute([$order_id, 'AGENT-007', $agent_name, $lat, $lng, $temp, $status]);
        }

        // Add to logs if log entry is provided
        if ($log_entry) {
            $log_status = trim($log_entry['status'] ?? $status);
            $log_loc = trim($log_entry['location'] ?? 'Current Position');
            $insertLog = $pdo->prepare("
                INSERT INTO fleet_logs (order_id, status, location_name) 
                VALUES (?, ?, ?)
            ");
            $insertLog->execute([$order_id, $log_status, $log_loc]);
        }

        echo json_encode(["success" => true, "message" => "Signal Registered in Sovereign Spine"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Signal Drift: " . $e->getMessage()]);
    }
} else {
    // GET Telemetry Method
    $order_id = trim($_GET['order_id'] ?? '');

    if (empty($order_id)) {
        // Return all fleet active tracking nodes
        try {
            $stmt = $pdo->query("SELECT * FROM fleet_tracking ORDER BY last_updated DESC");
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($all);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM fleet_tracking WHERE order_id = ?");
        $stmt->execute([$order_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            // Return simulation fallback if order is not in active database tracking yet
            $node_index = crc32($order_id) % count($MARITIME_NODES);
            $active_node = $MARITIME_NODES[$node_index];

            $drift_lat = (crc32($order_id . "lat") % 100) / 10000;
            $drift_lng = (crc32($order_id . "lng") % 100) / 10000;

            $current_lat = $active_node['lat'] + $drift_lat;
            $current_lng = $active_node['lng'] + $drift_lng;

            $temp = -22.5 + (rand(-5, 5) / 10);

            $response = [
                "order_id" => $order_id,
                "agent_id" => "AGENT-742",
                "agent_name" => "INS-ANDAMAN-FLEET",
                "current_lat" => $current_lat,
                "current_lng" => $current_lng,
                "current_temp" => $temp,
                "estimated_arrival" => "18 MINS",
                "status" => "ASSIGNED",
                "logs" => [
                    ["time" => "08:30 AM", "status" => "Harvest Dispatched", "location" => "Haddo Port Hub", "active" => false],
                    ["time" => "09:15 AM", "status" => "Cold-Chain Verified", "location" => "Sector 7", "active" => false],
                    ["time" => "10:20 AM", "status" => "Fleet Synchronization", "location" => $active_node['name'], "active" => true]
                ]
            ];
            echo json_encode($response);
            exit();
        }

        // Fetch logs for this order
        $logStmt = $pdo->prepare("
            SELECT status, location_name as location, timestamp as time 
            FROM fleet_logs 
            WHERE order_id = ? 
            ORDER BY timestamp DESC
        ");
        $logStmt->execute([$order_id]);
        $logs = $logStmt->fetchAll(PDO::FETCH_ASSOC);

        $formattedLogs = array_map(function($l) {
            return [
                "time" => date("h:i A", strtotime($l['time'])),
                "status" => $l['status'],
                "location" => $l['location'],
                "active" => true
            ];
        }, $logs);

        // If no database logs exist, provide simulation fallback logs
        if (empty($formattedLogs)) {
            $formattedLogs = [
                ["time" => "08:30 AM", "status" => "Harvest Dispatched", "location" => "Haddo Port Hub", "active" => false],
                ["time" => date("h:i A"), "status" => $data['status'], "location" => "Current Node", "active" => true]
            ];
        }

        $response = [
            "order_id" => $data['order_id'],
            "agent_id" => $data['agent_id'],
            "agent_name" => $data['agent_name'],
            "current_lat" => floatval($data['current_lat']),
            "current_lng" => floatval($data['current_lng']),
            "current_temp" => floatval($data['current_temp']),
            "estimated_arrival" => $data['estimated_arrival'] ?? "12 MINS",
            "status" => $data['status'],
            "logs" => $formattedLogs
        ];

        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Telemetry Retrieval Failure: " . $e->getMessage()]);
    }
}
?>
