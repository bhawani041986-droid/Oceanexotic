<?php
require 'db.php';
try {
    // Clear existing dummy data if it doesn't match real products
    $pdo->exec("DELETE FROM todays_catch WHERE product_id NOT IN (SELECT id FROM products)");
    
    // Insert fresh dummy data for real products for today
    $today = date('Y-m-d');
    $now = date('Y-m-d H:i:s');
    $expiry = date('Y-m-d 23:59:59');
    
    $dummies = [
        ['PRD-RED-01', 'SEL-001', 'Haddo Harbor', 50, 45, 450, 'MORNING', 'JUST ARRIVED'],
        ['PRD-KNG-02', 'SEL-001', 'Junglighat Harbor', 30, 28, 850, 'MORNING', 'FRESH'],
        ['PRD-POM-03', 'SEL-002', 'Phoenix Bay Harbor', 20, 15, 650, 'AFTERNOON', 'SELLING_FAST'],
        ['PRD-LOB-01', 'SEL-002', 'Haddo Harbor', 10, 8, 2500, 'MORNING', 'LIVE_BATCH']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO todays_catch (id, product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                           ON DUPLICATE KEY UPDATE catch_date = VALUES(catch_date), remaining_kg = VALUES(remaining_kg)");
    
    foreach ($dummies as $i => $d) {
        $id = "TC-NEW-" . ($i + 1);
        $stmt->execute([$id, $d[0], $d[1], $today, $d[2], $d[3], $d[4], $d[5], $now, $expiry, $d[6], $d[7]]);
    }
    
    echo "Success: Todays catch dummy data synchronized with real products.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
