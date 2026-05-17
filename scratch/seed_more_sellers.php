<?php
require_once 'db.php';
try {
    $pdo = getDB();
    
    // Check existing sellers
    $stmt = $pdo->query("SELECT id FROM users WHERE role = 'SELLER'");
    $existing = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $newSellers = [
        ['SEL-002', 'Mediterranean Catch', 'luca@medcatch.it', 'PENDING'],
        ['SEL-003', 'Pacific Rim Harvests', 'hiro@pacificrim.jp', 'PENDING'],
        ['SEL-004', 'Atlantic Deep Sourcing', 'john@atlanticdeep.com', 'SUSPENDED']
    ];
    
    foreach ($newSellers as $s) {
        if (!in_array($s[0], $existing)) {
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, 'SELLER', ?)");
            $stmt->execute([$s[0], $s[1], $s[2], password_hash('password123', PASSWORD_DEFAULT), $s[3]]);
            echo "Merchant {$s[0]} ({$s[1]}) registered with status {$s[3]}.\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
