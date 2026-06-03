<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db.php';

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
$role = strtoupper($data['role'] ?? 'CUSTOMER');
$status = ($role === 'AGENT') ? 'PENDING' : 'ACTIVE';
$id = 'USR-' . time() . rand(100, 999);

try {
    $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $email, $password, $role, $status]);
    
    echo json_encode(['success' => true, 'message' => 'Identity commissioned successfully', 'id' => $id, 'status' => $status]);
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email already registered in fleet registry: ' . $e->getMessage()]);
}
?>
