<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db.php';

try {
    $pdo = getDB();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $id = $_GET['id'] ?? '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing Identity ID']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode([
                'id' => $id,
                'name' => 'Maritime Citizen',
                'email' => '',
                'role' => 'customer',
                'grade' => 'Maritime Citizen',
                'loyalty_points' => 0,
                'avatar_url' => null,
            ]);
            exit;
        }

        // Preserve avatar_url from database
        $user['avatar_url'] = $user['avatar_url'] ?? null;

        $user['grade'] = $user['role'] === 'SELLER' ? 'Merchant' : 'Maritime Citizen';
        $user['loyalty_points'] = 0;
        echo json_encode($user);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing Identity ID']);
            exit;
        }

        $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?');
        $stmt->execute([$data['name'] ?? '', $data['email'] ?? '', $data['avatar_url'] ?? null, $id]);
        echo json_encode(['success' => true, 'message' => 'Identity Node Synchronized']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
