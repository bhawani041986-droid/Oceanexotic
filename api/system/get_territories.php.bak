<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../../db.php';

try {
    $pdo = getDB();
    $island = $_GET['island'] ?? null;
    
    $query = "SELECT t.*, p.name as parent_name, 
              (SELECT COUNT(*) FROM maritime_territories WHERE parent_id = t.id) as sub_nodes
              FROM maritime_territories t 
              LEFT JOIN maritime_territories p ON t.parent_id = p.id";
    
    $params = [];
    if ($island) {
        $query .= " WHERE t.name = ? OR p.name = ? OR p.parent_id IN (SELECT id FROM maritime_territories WHERE name = ?)";
        $params = [$island, $island, $island];
    }
    
    $query .= " ORDER BY t.zone_type ASC, t.name ASC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $territories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($territories);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
