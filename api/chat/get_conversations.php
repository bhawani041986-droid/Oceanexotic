<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once __DIR__ . '/../../db.php';

$userId = $_GET['user_id'] ?? 'USR-001'; // Fallback for demo

try {
    $pdo = getDB();
    
    // Fetch all conversations where the user is participant 1 or 2
    $stmt = $pdo->prepare("
        SELECT c.*, 
               u1.name as p1_name, u1.role as p1_role,
               u2.name as p2_name, u2.role as p2_role
        FROM chat_conversations c
        JOIN users u1 ON c.participant_1 = u1.id
        JOIN users u2 ON c.participant_2 = u2.id
        WHERE c.participant_1 = ? OR c.participant_2 = ?
        ORDER BY c.last_message_time DESC
    ");
    $stmt->execute([$userId, $userId]);
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transform data for frontend
    $result = array_map(function($conv) use ($userId) {
        $isP1 = ($conv['participant_1'] === $userId);
        return [
            'id' => $conv['id'],
            'other_party_id' => $isP1 ? $conv['participant_2'] : $conv['participant_1'],
            'other_party_name' => $isP1 ? $conv['p2_name'] : $conv['p1_name'],
            'other_party_role' => $isP1 ? $conv['p2_role'] : $conv['p1_role'],
            'last_message' => $conv['last_message_text'],
            'time' => date('H:i', strtotime($conv['last_message_time'])),
            'online' => true // Mocked for now
        ];
    }, $conversations);

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
