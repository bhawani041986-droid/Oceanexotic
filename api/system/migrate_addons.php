<?php
require_once __DIR__ . '/../../db.php';

try {
    $pdo = getDB();
    
    // Safely drop any foreign key constraint on order_items pointing to products
    $fk_stmt = $pdo->query("
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'order_items' 
          AND COLUMN_NAME = 'product_id' 
          AND REFERENCED_TABLE_NAME = 'products'
    ");
    $fks = $fk_stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($fks as $fk) {
        try {
            $pdo->exec("ALTER TABLE order_items DROP FOREIGN KEY `$fk`");
            echo "Dropped foreign key constraint: $fk\n";
        } catch (PDOException $ex) {
            echo "Could not drop foreign key constraint $fk: " . $ex->getMessage() . "\n";
        }
    }

    // Create addons table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS addons (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            type VARCHAR(100) DEFAULT 'Global Addon',
            description TEXT,
            image_url VARCHAR(512),
            is_active TINYINT(1) DEFAULT 1,
            allowed_areas TEXT NULL, -- Comma-separated list of allowed territory names (e.g. 'Phoenix Bay Jetty, Haddo Port')
            start_time TIME DEFAULT '00:00:00',
            end_time TIME DEFAULT '23:59:59',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed default addons if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM addons");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO addons (id, name, price, type, description, image_url, is_active, allowed_areas, start_time, end_time) VALUES
            ('ADD-001', 'Fish Fry Masala', 60.00, 'Global Addon', 'Traditional island spice mix for crispy fish fry.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=200&q=80', 1, NULL, '00:00:00', '23:59:59'),
            ('ADD-002', 'Fish Curry Masala', 80.00, 'Global Addon', 'Rich spices curated for authentic Andaman fish curries.', 'https://images.unsplash.com/photo-1512223792601-592a9809eed4?auto=format&fit=crop&w=200&q=80', 1, NULL, '00:00:00', '23:59:59'),
            ('ADD-003', 'Garlic Butter Sauce', 120.00, 'Premium Addon', 'Rich buttery sauce infused with garlic and local herbs.', 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=200&q=80', 1, NULL, '08:00:00', '22:00:00'),
            ('ADD-004', 'Lemon & Herbs Pack', 30.00, 'Global Addon', 'Fresh local lemons combined with freshly cut coriander.', 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=200&q=80', 1, NULL, '00:00:00', '23:59:59'),
            ('ADD-005', 'Vacuum Packaging', 80.00, 'Packaging Addon', 'State-of-the-art vacuum sealing to lock freshness.', 'https://images.unsplash.com/photo-1512223792601-592a9809eed4?auto=format&fit=crop&w=200&q=80', 1, NULL, '00:00:00', '23:59:59'),
            ('ADD-006', 'Ice Pack Chilling', 40.00, 'Delivery Addon', 'Double-chilled gel ice packs for temperature security.', 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=200&q=80', 1, NULL, '00:00:00', '23:59:59'),
            ('ADD-007', 'Seafood BBQ Marinade', 150.00, 'Premium Addon', 'Spicy marinade blend designed for charcoal grilling.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=200&q=80', 1, NULL, '10:00:00', '23:00:00')
        ");
    }

    echo "Migration completed: addons table ready.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
