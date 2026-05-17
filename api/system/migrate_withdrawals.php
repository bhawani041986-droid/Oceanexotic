<?php
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    
    // Create seller_withdrawals table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS seller_withdrawals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            seller_id VARCHAR(50) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            bank_node VARCHAR(255) NOT NULL,
            status ENUM('PENDING', 'PROCESSING', 'SETTLED', 'CANCELLED') DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (seller_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed some data for SEL-001 if empty
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM seller_withdrawals WHERE seller_id = 'SEL-001'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO seller_withdrawals (seller_id, amount, bank_node, status, created_at) VALUES
            ('SEL-001', 124450.00, 'Standard Chartered Hub', 'SETTLED', '2024-05-04 10:00:00'),
            ('SEL-001', 82000.00, 'Maritime Bank Alpha', 'PROCESSING', '2024-05-08 14:30:00'),
            ('SEL-001', 420000.00, 'Global Trade Node', 'SETTLED', '2024-04-28 09:15:00')
        ");
    }

    echo "Migration completed: seller_withdrawals table ready.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
