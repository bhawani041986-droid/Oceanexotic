<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../../../db.php';

$pdo = getDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'GET') {
    $type = $_GET['type'] ?? '';
    $parent_id = $_GET['parent_id'] ?? null;
    
    try {
        if ($type === 'countries') {
            $stmt = $pdo->query("SELECT * FROM logistics_countries ORDER BY name ASC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } elseif ($type === 'states') {
            $stmt = $pdo->prepare("SELECT * FROM logistics_states WHERE country_id = ? ORDER BY name ASC");
            $stmt->execute([$parent_id]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } elseif ($type === 'districts') {
            $stmt = $pdo->prepare("SELECT * FROM logistics_districts WHERE state_id = ? ORDER BY name ASC");
            $stmt->execute([$parent_id]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } elseif ($type === 'cities') {
            $stmt = $pdo->prepare("SELECT * FROM logistics_cities WHERE district_id = ? ORDER BY name ASC");
            $stmt->execute([$parent_id]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } elseif ($type === 'hubs') {
            $stmt = $pdo->prepare("SELECT * FROM logistics_hubs WHERE city_id = ? ORDER BY name ASC");
            $stmt->execute([$parent_id]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid type"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $type = $data['type'] ?? '';
    $name = $data['name'] ?? '';
    $parent_id = $data['parent_id'] ?? null;

    if (!$name) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Name is required"]);
        exit;
    }

    try {
        if ($type === 'country') {
            $code = $data['code'] ?? '';
            $stmt = $pdo->prepare("INSERT INTO logistics_countries (name, code) VALUES (?, ?)");
            $stmt->execute([$name, $code]);
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } elseif ($type === 'state') {
            $stmt = $pdo->prepare("INSERT INTO logistics_states (country_id, name) VALUES (?, ?)");
            $stmt->execute([$parent_id, $name]);
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } elseif ($type === 'district') {
            $stmt = $pdo->prepare("INSERT INTO logistics_districts (state_id, name) VALUES (?, ?)");
            $stmt->execute([$parent_id, $name]);
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } elseif ($type === 'city') {
            $stmt = $pdo->prepare("INSERT INTO logistics_cities (district_id, name) VALUES (?, ?)");
            $stmt->execute([$parent_id, $name]);
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } elseif ($type === 'hub') {
            $latitude = $data['latitude'] ?? null;
            $longitude = $data['longitude'] ?? null;
            $stmt = $pdo->prepare("INSERT INTO logistics_hubs (city_id, name, latitude, longitude) VALUES (?, ?, ?, ?)");
            $stmt->execute([$parent_id, $name, $latitude, $longitude]);
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid type"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}
?>
