<?php
require_once __DIR__ . '/../db.php';

try {
    $pdo = getDB();
    echo "Starting marketplace overhaul database migrations...\n";

    // 1. Create product_location_overrides table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS product_location_overrides (
            id VARCHAR(50) PRIMARY KEY,
            product_id VARCHAR(50) NOT NULL,
            territory_name VARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NULL,
            stock DECIMAL(10, 2) NULL,
            is_visible TINYINT(1) DEFAULT 1,
            status VARCHAR(30) DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_prod_loc (product_id, territory_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Table 'product_location_overrides' verified/created.\n";

    // 2. Create product_prep_options table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS product_prep_options (
            id VARCHAR(50) PRIMARY KEY,
            product_id VARCHAR(50) NOT NULL,
            prep_type VARCHAR(50) NOT NULL, -- 'RAW', 'MARINATED', 'GRILLED', 'FRIED'
            name VARCHAR(255) NOT NULL,
            price_flat_add DECIMAL(10, 2) DEFAULT 0.00,
            is_available TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_prod_prep (product_id, name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "Table 'product_prep_options' verified/created.\n";

    // 3. Seed default preparation options for all existing products if empty
    $prodCountStmt = $pdo->query("SELECT COUNT(*) FROM product_prep_options");
    if ($prodCountStmt->fetchColumn() == 0) {
        echo "Seeding default preparation options for existing products...\n";
        $products = $pdo->query("SELECT id FROM products")->fetchAll(PDO::FETCH_ASSOC);
        
        $prepStmt = $pdo->prepare("
            INSERT INTO product_prep_options (id, product_id, prep_type, name, price_flat_add, is_available, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($products as $p) {
            $pid = $p['id'];
            // Raw / Cleaned
            $prepStmt->execute(['PREP-' . uniqid(), $pid, 'RAW', 'Raw / Cleaned', 0.00, 1, 0]);
            // Chettinad Fry Masala Coating
            $prepStmt->execute(['PREP-' . uniqid(), $pid, 'FRIED', 'Chettinad Fry Masala', 50.00, 1, 1]);
            // Classic Tandoori Marinade
            $prepStmt->execute(['PREP-' . uniqid(), $pid, 'MARINATED', 'Classic Tandoori Marinade', 80.00, 1, 2]);
            // Charcoal Grill Garlic Butter Rub
            $prepStmt->execute(['PREP-' . uniqid(), $pid, 'GRILLED', 'Charcoal Grill Garlic Butter Rub', 100.00, 1, 3]);
        }
        echo "Successfully seeded default preparation options.\n";
    }

    // 4. Seed sample location overrides to verify functionality
    $overridesCountStmt = $pdo->query("SELECT COUNT(*) FROM product_location_overrides");
    if ($overridesCountStmt->fetchColumn() == 0) {
        echo "Seeding sample location overrides...\n";
        $locOverrideStmt = $pdo->prepare("
            INSERT INTO product_location_overrides (id, product_id, territory_name, price, stock, is_visible, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        // Overrides for Surmai (surmai-seer-fish)
        // Aberdeen Bazar: price 1800, stock 25
        $locOverrideStmt->execute(['LOCOV-' . uniqid(), 'surmai-seer-fish', 'Aberdeen Bazar', 1800.00, 25.00, 1, 'ACTIVE']);
        // Haddo Port: price 1500, stock 40
        $locOverrideStmt->execute(['LOCOV-' . uniqid(), 'surmai-seer-fish', 'Haddo Port', 1500.00, 40.00, 1, 'ACTIVE']);
        // Phoenix Bay Jetty: COMING_SOON
        $locOverrideStmt->execute(['LOCOV-' . uniqid(), 'surmai-seer-fish', 'Phoenix Bay Jetty', 1600.00, 0.00, 1, 'COMING_SOON']);
        
        // Overrides for Bangda (bangda-mackerel)
        // Aberdeen Bazar: price 350, stock 80
        $locOverrideStmt->execute(['LOCOV-' . uniqid(), 'bangda-mackerel', 'Aberdeen Bazar', 350.00, 80.00, 1, 'ACTIVE']);
        // Dollygunj: OUT_OF_STOCK
        $locOverrideStmt->execute(['LOCOV-' . uniqid(), 'bangda-mackerel', 'Dollygunj', 320.00, 0.00, 1, 'OUT_OF_STOCK']);
        // Junglighat Fish Landing: is_visible = 0 (hidden)
        $locOverrideStmt->execute(['LOCOV-' . uniqid(), 'bangda-mackerel', 'Junglighat Fish Landing', 320.00, 50.00, 0, 'ACTIVE']);

        echo "Successfully seeded sample location overrides.\n";
    }

    echo "Marketplace overhaul database migrations completed successfully.\n";

} catch (Exception $e) {
    die("Database migration failed: " . $e->getMessage() . "\n");
}
?>
