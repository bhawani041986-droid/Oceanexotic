<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$participant_1 = $data['participant_1'] ?? 'ADM-001';
$participant_2 = $data['participant_2'] ?? null;

if (!$participant_2) {
    http_response_code(400);
    echo json_encode(["error" => "Target Node ID required."]);
    exit;
}

try {
    $pdo = getDB();
    
    // Check if conversation already exists
    $stmt = $pdo->prepare("
        SELECT id FROM chat_conversations 
        WHERE (participant_1 = ? AND participant_2 = ?)
           OR (participant_1 = ? AND participant_2 = ?)
        LIMIT 1
    ");
    $stmt->execute([$participant_1, $participant_2, $participant_2, $participant_1]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        echo json_encode([
            "status" => "success", 
            "message" => "Connection already exists.",
            "conversation_id" => $existing['id']
        ]);
        exit;
    }

    // Attempt to fetch name of participant 2 to set as title (optional)
    $title = $participant_2; // Fallback
    $userStmt = $pdo->prepare("SELECT name FROM users WHERE user_id = ? LIMIT 1");
    $userStmt->execute([$participant_2]);
    $u = $userStmt->fetch(PDO::FETCH_ASSOC);
    if ($u) {
        $title = $u['name'];
    }

    // Create new conversation
    $insert = $pdo->prepare("INSERT INTO chat_conversations (title, participant_1, participant_2, status, priority) VALUES (?, ?, ?, 'OPEN', 'NORMAL')");
    $insert->execute([$title, $participant_1, $participant_2]);
    $newId = $pdo->lastInsertId();

    echo json_encode([
        "status" => "success",
        "message" => "Secure channel established.",
        "conversation_id" => $newId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
