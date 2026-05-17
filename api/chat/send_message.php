<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once __DIR__ . '/../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$convId = $data['conversation_id'] ?? null;
$senderId = $data['sender_id'] ?? 'USR-001';
$text = $data['message_text'] ?? '';

if (!$convId || !$text) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid transmission packet."]);
    exit;
}

try {
    $pdo = getDB();
    $pdo->beginTransaction();

    // 1. Insert message
    $stmt = $pdo->prepare("INSERT INTO chat_messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)");
    $stmt->execute([$convId, $senderId, $text]);

    // 2. Update conversation last message
    $stmt = $pdo->prepare("UPDATE chat_conversations SET last_message_text = ?, last_message_time = NOW() WHERE id = ?");
    $stmt->execute([$text, $convId]);

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Signal synchronized."]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
