<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Use absolute path based on DOCUMENT_ROOT for reliability
$doc_root = $_SERVER['DOCUMENT_ROOT'] ?? dirname(__FILE__, 4);
// Try to detect the FISH_MARKET public path
$base_path = dirname(__FILE__, 3); // Goes from api/system/ -> FISH_MARKET root
$upload_dir = $base_path . DIRECTORY_SEPARATOR . "public" . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "original" . DIRECTORY_SEPARATOR;

if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0777, true)) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Cannot create upload dir: $upload_dir"]);
        exit;
    }
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "No file detected.",
        "post_keys" => array_keys($_POST),
        "files_keys" => array_keys($_FILES)
    ]);
    exit;
}

$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => "File too large (server ini)",
        UPLOAD_ERR_FORM_SIZE  => "File too large (form)",
        UPLOAD_ERR_PARTIAL    => "Partial upload",
        UPLOAD_ERR_NO_FILE    => "No file sent",
        UPLOAD_ERR_NO_TMP_DIR => "No tmp dir",
        UPLOAD_ERR_CANT_WRITE => "Cannot write",
        UPLOAD_ERR_EXTENSION  => "Extension blocked"
    ];
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $errors[$file['error']] ?? "Unknown error: " . $file['error']]);
    exit;
}

// Sanitize filename and add timestamp
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "File type not allowed. Use: " . implode(', ', $allowed)]);
    exit;
}

$filename = time() . "_" . preg_replace("/[^a-zA-Z0-9\._-]/", "_", basename($file['name']));
$target_file = $upload_dir . $filename;

if (move_uploaded_file($file['tmp_name'], $target_file)) {
    $relative_path = "/uploads/original/" . $filename;
    echo json_encode(["status" => "success", "url" => $relative_path]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to move file.",
        "target" => $target_file,
        "tmp_name" => $file['tmp_name'],
        "upload_dir_writable" => is_writable($upload_dir)
    ]);
}
?>
