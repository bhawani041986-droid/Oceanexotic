<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once '../../db.php';
$pdo = getDB();

// --- GET: Fetch address vault for a user ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? '';
    if (!$userId) {
        http_response_code(400);
        echo json_encode(["error" => "Missing Citizen ID"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare(
            "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC"
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Mirror the Next.js route formatting: type = label, address = address_line1
        $formatted = array_map(function($addr) {
            $addr['type']    = $addr['label'] ?? 'HOME';
            $addr['address'] = $addr['address_line1'] ?? '';
            return $addr;
        }, $rows);
        echo json_encode($formatted);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage(), "data" => []]);
    }
    exit;
}

// --- POST: Commission new address node ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $userId    = $body['user_id']    ?? '';
    $type      = $body['type']       ?? 'HOME';
    $hotelName = $body['hotel_name'] ?? '';
    $roomNo    = $body['room_no']    ?? '';
    $jetty     = $body['jetty']      ?? '';
    $address   = $body['address']    ?? '';
    $phone     = $body['phone']      ?? '';
    $isDefault = !empty($body['is_default']) ? 1 : 0;

    if (!$userId || !$address) {
        http_response_code(400);
        echo json_encode(["error" => "Missing Coordinate Nodes"]);
        exit;
    }
    try {
        if ($isDefault) {
            $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?")
                ->execute([$userId]);
        }
        $pdo->prepare(
            "INSERT INTO user_addresses (user_id, label, hotel_name, room_no, jetty, address_line1, phone, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )->execute([$userId, $type, $hotelName, $roomNo, $jetty, $address, $phone, $isDefault]);
        echo json_encode(["success" => true, "message" => "Coordinate Node Commissioned"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

// --- DELETE: Decommission address ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing Node ID"]);
        exit;
    }
    try {
        $pdo->prepare("DELETE FROM user_addresses WHERE id = ?")->execute([$id]);
        echo json_encode(["success" => true, "message" => "Coordinate Node Purged"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
