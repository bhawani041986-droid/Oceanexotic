<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(0);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../db.php';

$userId = $_POST['user_id'] ?? '';

if (!$userId) {
    http_response_code(400);
    echo json_encode(["error" => "User identity ID is required."]);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["error" => "No image file provided."]);
    exit;
}

// Ensure target directories exist under public/uploads/avatars
$uploadDir = __DIR__ . '/../../public/uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$fileName = time() . '_' . basename($_FILES['file']['name']);
$targetFile = $uploadDir . $fileName;

if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
    $avatarPath = '/uploads/avatars/' . $fileName;
    
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
        $stmt->execute([$avatarPath, $userId]);
        
        echo json_encode([
            "success" => true, 
            "avatar_url" => $avatarPath,
            "message" => "Identity avatar successfully synchronized and hardened."
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to write avatar asset to disk."]);
}
?>
