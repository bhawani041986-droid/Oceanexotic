<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    
    // 0. Ensure Demo Users exist
    $pdo->exec("INSERT IGNORE INTO users (id, name, email, role, status) VALUES 
        ('USR-001', 'Admiral John', 'john@maritime.com', 'CUSTOMER', 'ACTIVE'),
        ('SEL-001', 'Arctic Harvest', 'harvest@arctic.com', 'SELLER', 'ACTIVE'),
        ('ADM-001', 'Central Command', 'admin@oceanfresh.com', 'ADMIN', 'ACTIVE')
    ");

    // 1. Create Conversations Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS chat_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) DEFAULT NULL,
        participant_1 VARCHAR(50) NOT NULL,
        participant_2 VARCHAR(50) NOT NULL,
        last_message_text TEXT DEFAULT NULL,
        last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (participant_1),
        INDEX (participant_2)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 2. Create Messages Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_id VARCHAR(50) NOT NULL,
        message_text TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 3. Seed some initial data if empty
    $count = $pdo->query("SELECT COUNT(*) FROM chat_conversations")->fetchColumn();
    if ($count == 0) {
        // Mock conversation between a customer and a seller
        $pdo->exec("INSERT INTO chat_conversations (participant_1, participant_2, last_message_text) 
                    VALUES ('USR-001', 'SEL-001', 'Greetings, Captain. Cold-chain integrity verified.')");
        
        $convId = $pdo->lastInsertId();
        
        $pdo->exec("INSERT INTO chat_messages (conversation_id, sender_id, message_text) 
                    VALUES ($convId, 'SEL-001', 'Greetings, Captain. We have received your commission for the Andaman King Lobster.')");
        $pdo->exec("INSERT INTO chat_messages (conversation_id, sender_id, message_text) 
                    VALUES ($convId, 'USR-001', 'Excellent. Has the cold-chain protocol been initiated?')");
        $pdo->exec("INSERT INTO chat_messages (conversation_id, sender_id, message_text) 
                    VALUES ($convId, 'SEL-001', 'Confirmed. Sensors are stabilized at -22°C.')");
        // Mock conversation 2: Customer and Admin
        $pdo->exec("INSERT INTO chat_conversations (participant_1, participant_2, last_message_text) 
                    VALUES ('USR-001', 'ADM-001', 'Secure channel established with Support Hub.')");
        
        $convId2 = $pdo->lastInsertId();
        $pdo->exec("INSERT INTO chat_messages (conversation_id, sender_id, message_text) 
                    VALUES ($convId2, 'ADM-001', 'Greetings, Admiral. How can Central Command assist you today?')");
    }

    echo json_encode(["status" => "success", "message" => "Maritime Messaging Registry Synchronized."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
