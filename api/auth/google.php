<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db.php';

$data = json_decode(file_get_contents('php://input'), true);
$idToken = $data['idToken'] ?? '';
$role = strtoupper($data['role'] ?? 'CUSTOMER');

if (empty($idToken)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing Google ID Token']);
    exit;
}

// In a real production scenario, you would verify the $idToken with Google's API here.
// e.g., https://oauth2.googleapis.com/tokeninfo?id_token=$idToken
// For this local implementation, we will decode the JWT token (payload is the middle segment)
$tokenParts = explode('.', $idToken);
if (count($tokenParts) !== 3) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid Google ID Token format']);
    exit;
}

$payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])), true);
if (!$payload || !isset($payload['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Failed to parse Google user information']);
    exit;
}

$email = $payload['email'];
$name = $payload['name'] ?? 'Google User';

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // User exists, log them in
        if ($user['status'] === 'PENDING' || $user['status'] === 'INACTIVE') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access Denied: Account status is ' . strtolower($user['status'])]);
            exit;
        }

        $token = bin2hex(random_bytes(32));
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    } else {
        // User doesn't exist, create account
        $id = 'USR-' . time() . rand(100, 999);
        $status = ($role === 'AGENT') ? 'PENDING' : 'ACTIVE';
        $randomPassword = bin2hex(random_bytes(10));
        $passwordHash = password_hash($randomPassword, PASSWORD_DEFAULT);

        // Safely insert with fallback
        try {
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $name, $email, $passwordHash, $role, $status, '']);
        } catch (PDOException $e) {
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $name, $email, $passwordHash, $role, $status]);
        }

        $token = bin2hex(random_bytes(32));
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'role' => $role
            ]
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registry handshake failure']);
}
?>
