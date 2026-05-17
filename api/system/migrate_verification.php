<?php
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    
    // Create seller_verification_docs table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS seller_verification_docs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            seller_id VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            doc_type ENUM('LEGAL', 'QUALITY', 'LOGISTICS', 'IDENTITY') NOT NULL,
            file_path VARCHAR(255) DEFAULT NULL,
            status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') DEFAULT 'PENDING',
            expiry_date DATE DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (seller_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed some data for SEL-001 if empty
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM seller_verification_docs WHERE seller_id = 'SEL-001'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO seller_verification_docs (seller_id, title, doc_type, status, expiry_date) VALUES
            ('SEL-001', 'Maritime Business License', 'LEGAL', 'VERIFIED', '2026-05-30'),
            ('SEL-001', 'Cold-Chain Certification', 'QUALITY', 'PENDING', '2025-06-15'),
            ('SEL-001', 'Global Export Permit', 'LOGISTICS', 'EXPIRED', '2023-12-31')
        ");
    }

    echo "Migration completed: seller_verification_docs table ready.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
