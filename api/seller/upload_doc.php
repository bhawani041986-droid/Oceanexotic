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

$sellerId = $_POST['seller_id'] ?? 'SEL-001';
$title = $_POST['title'] ?? '';
$docType = $_POST['doc_type'] ?? 'LEGAL';
$expiryDate = $_POST['expiry_date'] ?? date('Y-m-d', strtotime('+1 year'));

if (!$title) {
    http_response_code(400);
    echo json_encode(["error" => "Credential title is required for commissioning."]);
    exit;
}

// Handle File Upload
$filePath = null;
if (isset($_FILES['file'])) {
    $uploadDir = __DIR__ . '/../../uploads/verification/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileName = time() . '_' . basename($_FILES['file']['name']);
    $targetFile = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        $filePath = 'uploads/verification/' . $fileName;
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to transmit asset to registry."]);
        exit;
    }
}

try {
    $pdo = getDB();
    
    // Check if doc with same title exists to update it
    $stmt = $pdo->prepare("SELECT id FROM seller_verification_docs WHERE seller_id = ? AND title = ?");
    $stmt->execute([$sellerId, $title]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        $stmt = $pdo->prepare("UPDATE seller_verification_docs SET file_path = ?, status = 'PENDING', expiry_date = ? WHERE id = ?");
        $stmt->execute([$filePath, $expiryDate, $existing['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO seller_verification_docs (seller_id, title, doc_type, file_path, status, expiry_date) VALUES (?, ?, ?, ?, 'PENDING', ?)");
        $stmt->execute([$sellerId, $title, $docType, $filePath, $expiryDate]);
    }

    echo json_encode(["success" => true, "status" => "PENDING"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
