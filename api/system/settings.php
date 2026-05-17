<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../db.php';

$pdo = getDB();

// Auto-Initialize Registry Table if missing
$pdo->exec("CREATE TABLE IF NOT EXISTS marketplace_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM marketplace_settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = json_decode($row['setting_value'], true);
        }
        echo json_encode(["status" => "success", "settings" => $settings]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} 

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['settings'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid payload."]);
        exit;
    }

    try {
        $pdo->beginTransaction();
        
        foreach ($input['settings'] as $key => $value) {
            $stmt = $pdo->prepare("INSERT INTO marketplace_settings (setting_key, setting_value) 
                                   VALUES (:key, :value) 
                                   ON DUPLICATE KEY UPDATE setting_value = :value2");
            $jsonValue = json_encode($value);
            $stmt->execute([
                'key' => $key,
                'value' => $jsonValue,
                'value2' => $jsonValue
            ]);
        }
        
        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Settings synchronized to Sovereign Database."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
