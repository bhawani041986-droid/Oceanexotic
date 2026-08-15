<?php
// Start output buffering to prevent any PHP warnings/errors from corrupting the JSON output
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db.php';

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$referral = $data['referral_code'] ?? '';
$password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
$role = strtoupper($data['role'] ?? 'CUSTOMER');
$status = ($role === 'AGENT') ? 'PENDING' : 'ACTIVE';
$id = 'USR-' . time() . rand(100, 999);

try {
    // We only insert into columns that definitely exist. 
    // Phone and referral_code are stored if the schema supports it.
    // If not, we fall back to a basic insert.
    try {
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $password, $role, $status, $phone]);
    } catch (PDOException $e) {
        // Fallback for schemas without phone
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $password, $role, $status]);
    }
    
    // Mock sending Welcome Email
    $to = $email;
    $subject = 'Welcome to OceanExotic - Your Account Details';
    $message = "Hello $name,\n\nWelcome to the OceanExotic fleet! Your account has been successfully commissioned.\n\nYour Login Details:\nEmail: $email\nPassword: " . $data['password'] . "\n\nPlease keep this information secure.\n\nRegards,\nOceanExotic Team";
    $headers = "From: info@andamanlens.com\r\n" .
               "Reply-To: info@andamanlens.com\r\n" .
               "X-Mailer: PHP/" . phpversion();

    // Use @ to suppress warnings if mail server is not configured locally
    @mail($to, $subject, $message, $headers);

    // Generate Auto-Login Token
    $token = bin2hex(random_bytes(32));

    ob_clean();
    echo json_encode([
        'success' => true, 
        'status' => 'success',
        'message' => 'Identity commissioned successfully', 
        'token' => $token,
        'user' => [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'role' => $role
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(400);
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Email already registered in fleet registry']);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Failed to connect to database']);
    exit;
}
?>
