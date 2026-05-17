<?php
require_once 'db.php';
try {
    $pdo = getDB();
    echo "--- USERS ---\n";
    $users = $pdo->query("SELECT id, name, role FROM users")->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);
    
    echo "\n--- CONVERSATIONS ---\n";
    $convs = $pdo->query("SELECT * FROM chat_conversations")->fetchAll(PDO::FETCH_ASSOC);
    print_r($convs);
    
    echo "\n--- MESSAGES ---\n";
    $msgs = $pdo->query("SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    print_r($msgs);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
