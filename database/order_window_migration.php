<?php
require_once __DIR__ . '/../db.php';
$pdo = getDB();

echo "=== ORDER WINDOW MIGRATION ===\n";

try {
    // 1. Add is_pre_order column to orders table
    $col = $pdo->query("SHOW COLUMNS FROM orders LIKE 'is_pre_order'");
    if (!$col->fetch()) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN is_pre_order TINYINT(1) DEFAULT 0 COMMENT '1 = pre-order for next open slot'");
        echo "[OK] Column is_pre_order added to orders.\n";
    } else {
        echo "[SKIP] Column is_pre_order already exists.\n";
    }

    // 2. Add is_pre_order index
    $idx = $pdo->query("SHOW INDEX FROM orders WHERE Key_name = 'idx_is_pre_order'");
    if (!$idx->fetch()) {
        $pdo->exec("ALTER TABLE orders ADD INDEX idx_is_pre_order (is_pre_order)");
        echo "[OK] Index idx_is_pre_order added.\n";
    } else {
        echo "[SKIP] Index idx_is_pre_order already exists.\n";
    }

    // 3. Ensure marketplace_settings table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS marketplace_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    echo "[OK] marketplace_settings table ensured.\n";

    // 4. Seed default order window settings (only if not already set)
    $defaults = [
        'ordersEnabled'   => true,
        'ordersOpenTime'  => '09:00',
        'ordersCloseTime' => '22:00',
        'ordersNextOpenText' => 'Tomorrow at 09:00 AM'
    ];

    $stmt = $pdo->prepare("INSERT INTO marketplace_settings (setting_key, setting_value)
        VALUES (:key, :value)
        ON DUPLICATE KEY UPDATE setting_key = setting_key");

    foreach ($defaults as $key => $value) {
        $stmt->execute(['key' => $key, 'value' => json_encode($value)]);
        echo "[OK] Default setting '$key' seeded (skipped if existed).\n";
    }

    echo "\n=== MIGRATION COMPLETE ===\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
