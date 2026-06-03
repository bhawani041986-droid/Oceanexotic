<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db.php';
$pdo = getDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM addons ORDER BY id ASC");
        $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert numbers and formats to match what JSON expects
        $formatted = array_map(function($addon) {
            $addon['price'] = (float)$addon['price'];
            $addon['is_active'] = (int)$addon['is_active'];
            return $addon;
        }, $addons);

        echo json_encode($formatted);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid payload"]);
        exit;
    }

    $action = $data['action'] ?? 'save';

    if ($action === 'delete') {
        $id = $data['id'] ?? '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Addon ID required for deletion"]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM addons WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "Addon decommissioned successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'toggle_active') {
        $id = $data['id'] ?? '';
        $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 0;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Addon ID required for status toggle"]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE addons SET is_active = ? WHERE id = ?");
            $stmt->execute([$is_active, $id]);
            echo json_encode(["status" => "success", "message" => "Addon status updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }

    // Default action: Save (create or update)
    $id = $data['id'] ?? '';
    $name = $data['name'] ?? '';
    $price = isset($data['price']) ? (float)$data['price'] : 0.0;
    $type = $data['type'] ?? 'Global Addon';
    $description = $data['description'] ?? '';
    $image_url = $data['image_url'] ?? '';
    $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;
    $allowed_areas = $data['allowed_areas'] ?? null; // comma-separated string
    $start_time = $data['start_time'] ?? '00:00:00';
    $end_time = $data['end_time'] ?? '23:59:59';

    if (!$name || $price <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Name and positive price are required"]);
        exit;
    }

    try {
        if ($id) {
            // Update existing addon
            $stmt = $pdo->prepare("
                UPDATE addons SET 
                    name = ?, 
                    price = ?, 
                    type = ?, 
                    description = ?, 
                    image_url = ?, 
                    is_active = ?, 
                    allowed_areas = ?, 
                    start_time = ?, 
                    end_time = ?
                WHERE id = ?
            ");
            $stmt->execute([$name, $price, $type, $description, $image_url, $is_active, $allowed_areas, $start_time, $end_time, $id]);
            echo json_encode(["status" => "success", "message" => "Addon details updated successfully", "id" => $id]);
        } else {
            // Create a new addon, generate dynamic sequential ID e.g. ADD-008
            $stmt = $pdo->query("SELECT id FROM addons WHERE id LIKE 'ADD-%' ORDER BY id DESC LIMIT 1");
            $last_id_row = $stmt->fetch();
            $new_seq = 1;
            if ($last_id_row) {
                $last_num = (int)str_replace("ADD-", "", $last_id_row['id']);
                $new_seq = $last_num + 1;
            }
            $new_id = "ADD-" . str_pad($new_seq, 3, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("
                INSERT INTO addons (id, name, price, type, description, image_url, is_active, allowed_areas, start_time, end_time) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$new_id, $name, $price, $type, $description, $image_url, $is_active, $allowed_areas, $start_time, $end_time]);
            echo json_encode(["status" => "success", "message" => "New addon registered successfully", "id" => $new_id]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}
?>
