<?php
/**
 * OceanFresh Sovereign Query Bridge
 * Bypasses Node.js driver limitations by utilizing XAMPP's native PHP/MySQL stack.
 */
require_once '../db.php';

// Secure Handshake - Ensure only local Next.js server can call this
// In a production environment, you would add a secret TOKEN check here.

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['query'])) {
    echo json_encode(['error' => 'Empty Signal Handshake']);
    exit;
}

$query = $input['query'];
$params = isset($input['params']) ? $input['params'] : [];
$type = isset($input['type']) ? $input['type'] : 'SELECT'; // SELECT, INSERT, UPDATE, DELETE

try {
    $db = getDB();
    $stmt = $db->prepare($query);
    $stmt->execute($params);

    if ($type === 'SELECT') {
        $results = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $results]);
    } else if ($type === 'INSERT') {
        echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
    } else {
        echo json_encode(['success' => true, 'affected' => $stmt->rowCount()]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Maritime Bridge Failure: ' . $e->getMessage()]);
}
?>
