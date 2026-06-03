<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No file received in multipart request."]);
        exit;
    }

    $file = $_FILES['file'];
    
    // Check for upload error codes
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Upload failed with error code: " . $file['error']]);
        exit;
    }

    // Set destination directory (public/uploads/original)
    $uploadDir = __DIR__ . '/../public/uploads/original/';
    
    // Ensure folder structure exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique name to prevent collisions
    $rawName = basename($file['name']);
    $cleanName = preg_replace('/[^a-zA-Z0-9._-]/', '-', $rawName);
    $fileName = time() . '-' . rand(1000, 9999) . '-' . $cleanName;
    $targetFile = $uploadDir . $fileName;

    // Move file to target directory
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // Return standard relative URL used by assetUrl resolver in React Native and Next.js
        $publicUrl = "/uploads/original/" . $fileName;
        echo json_encode(["status" => "success", "url" => $publicUrl]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to write file to public storage node."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
