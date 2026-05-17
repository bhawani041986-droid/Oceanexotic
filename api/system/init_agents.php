<?php
// Run this ONCE to add the agents table and seed test agents
require_once '../../db.php';
try {
    $pdo = getDB();
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    $pdo->exec("CREATE TABLE IF NOT EXISTS delivery_agents (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        zone VARCHAR(100) DEFAULT 'Port Blair',
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed agents
    $pdo->exec("INSERT IGNORE INTO delivery_agents (id, name, phone, zone) VALUES
        ('AGENT-742', 'Rajan Kumar', '+91-9531828099', 'Port Blair Central'),
        ('AGENT-501', 'Mohan Das', '+91-9876543210', 'Haddo Port Zone'),
        ('AGENT-319', 'Suresh Pillai', '+91-9988776655', 'Phoenix Bay Sector'),
        ('AGENT-108', 'Arjun Nair', '+91-9123456789', 'Aberdeen Bazar Hub')
    ");

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo json_encode(["status" => "success", "message" => "Agent registry initialized."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
