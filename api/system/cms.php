<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    $pdo = getDB();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM cms_content ORDER BY updated_at DESC");
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "content" => $items]);
    } 
    
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) throw new Exception("Invalid data");

        if (isset($data['id']) && is_numeric($data['id'])) {
            // Update
            $stmt = $pdo->prepare("UPDATE cms_content SET title = ?, type = ?, status = ?, sector = ?, image_url = ? WHERE id = ?");
            $stmt->execute([
                $data['title'],
                $data['type'],
                $data['status'],
                $data['sector'],
                $data['image_url'],
                $data['id']
            ]);
            echo json_encode(["status" => "success", "message" => "Directive Updated."]);
        } else {
            // Create
            $stmt = $pdo->prepare("INSERT INTO cms_content (title, type, status, sector, image_url) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'],
                $data['type'] ?? 'BANNER',
                $data['status'] ?? 'DRAFT',
                $data['sector'] ?? 'GLOBAL',
                $data['image_url'] ?? ''
            ]);
            echo json_encode(["status" => "success", "message" => "Directive Commissioned.", "id" => $pdo->lastInsertId()]);
        }
    } 
    
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID required");

        $stmt = $pdo->prepare("DELETE FROM cms_content WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Directive Decommissioned."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
