<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once '../../db.php';

try {
    $pdo = getDB();
    $island = $_GET['island'] ?? null;
    
    if ($island) {
        $query = "WITH RECURSIVE territory_tree AS (
                      SELECT * FROM maritime_territories WHERE name = ?
                      UNION ALL
                      SELECT mt.* FROM maritime_territories mt
                      INNER JOIN territory_tree tt ON mt.parent_id = tt.id
                  )
                  SELECT t.*, p.name as parent_name, 
                  (SELECT COUNT(*) FROM maritime_territories WHERE parent_id = t.id) as sub_nodes
                  FROM territory_tree t 
                  LEFT JOIN maritime_territories p ON t.parent_id = p.id
                  ORDER BY t.zone_type ASC, t.name ASC";
        $params = [$island];
    } else {
        $query = "SELECT t.*, p.name as parent_name, 
                  (SELECT COUNT(*) FROM maritime_territories WHERE parent_id = t.id) as sub_nodes
                  FROM maritime_territories t 
                  LEFT JOIN maritime_territories p ON t.parent_id = p.id
                  ORDER BY t.zone_type ASC, t.name ASC";
        $params = [];
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $territories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($territories);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
