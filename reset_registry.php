<?php
require_once 'db.php';

echo "⚓ Starting OceanFresh Registry Reset...\n";

try {
    $pdo = getDB();

    // 1. Clear Old Data
    echo "🧹 Cleansing old records...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE users");
    $pdo->exec("TRUNCATE TABLE sellers");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    $defaultPassword = password_hash('ocean123', PASSWORD_DEFAULT);

    // 2. Add 4 Sellers
    $sellers = [
        ['name' => 'Bhawani Fish Center', 'email' => 'bhawani@oceanfresh.com', 'shop' => 'Bhawani Fish Center Bhatubasti', 'address' => 'Bhatubasti, Port Blair'],
        ['name' => 'Devansh Fish Hub', 'email' => 'devansh@oceanfresh.com', 'shop' => 'Devansh Fish hub Garacharma', 'address' => 'Garacharma, Port Blair'],
        ['name' => 'Deep Fishing', 'email' => 'deep@oceanfresh.com', 'shop' => 'Deep Fishing Dollygunj', 'address' => 'Dollygunj, Port Blair'],
        ['name' => 'Rig Fishing', 'email' => 'rig@oceanfresh.com', 'shop' => 'Rig Fishing Haddo', 'address' => 'Haddo, Port Blair'],
    ];

    foreach ($sellers as $s) {
        // Create user
        $userId = 'USR-' . time() . rand(100, 999);
        // Create user
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'SELLER')");
        $stmt->execute([$userId, $s['name'], $s['email'], $defaultPassword]);

        $sellerId = 'SEL-' . $userId;

        // Create seller record (id will be SEL-xxx format)
        $sellerId = 'SEL-' . $userId;
        $stmt = $pdo->prepare("INSERT INTO sellers (id, name, email, status) VALUES (?, ?, ?, 'ACTIVE')");
        $stmt->execute([$sellerId, $s['shop'], $s['email']]);
        echo "✅ Registered Seller: " . $s['name'] . " as " . $sellerId . "\n";
    }

    // 3. Add 2 Customers
    $customers = [
        ['name' => 'John Doe', 'email' => 'john@gmail.com'],
        ['name' => 'Jane Smith', 'email' => 'jane@gmail.com'],
    ];

    foreach ($customers as $c) {
        $userId = 'USR-' . time() . rand(100, 999);
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'CUSTOMER')");
        $stmt->execute([$userId, $c['name'], $c['email'], $defaultPassword]);
        echo "✅ Registered Customer: " . $c['name'] . " as " . $userId . "\n";
    }

    // 4. Add 4 Agents
    $agents = [
        ['name' => 'Abijeet', 'email' => 'abijeet@agent.com'],
        ['name' => 'Avay', 'email' => 'avay@agent.com'],
        ['name' => 'Banti', 'email' => 'banti@agent.com'],
        ['name' => 'Ravi', 'email' => 'ravi@agent.com'],
    ];

    foreach ($agents as $a) {
        $userId = 'USR-' . time() . rand(100, 999);
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'AGENT')");
        $stmt->execute([$userId, $a['name'], $a['email'], $defaultPassword]);
        echo "✅ Registered Agent: " . $a['name'] . " as " . $userId . "\n";
    }

    echo "\n🚀 Registry Reset Complete!\n";
    echo "Default Password for all: ocean123\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
