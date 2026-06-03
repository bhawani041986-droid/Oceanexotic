<?php
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Create a dummy seller
    $sellerId = "SEL-DUMMY-001";
    $pdo->prepare("INSERT IGNORE INTO sellers (id, name, email) VALUES (?, ?, ?)")
        ->execute([$sellerId, "Andaman Fresh Catch", "andaman@fresh.com"]);
        
    // Insert products
    $products = [
        ['id' => 'PRD-001', 'name' => 'Red Snapper', 'price' => 580.00, 'category' => 'Reef Fish', 'desc' => 'High-quality reef catch', 'img' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800'],
        ['id' => 'PRD-002', 'name' => 'Tiger Prawns', 'price' => 1150.00, 'category' => 'Crustaceans', 'desc' => 'Extra large jumbo prawns', 'img' => 'https://images.unsplash.com/photo-1559113202-c916b8e44373?q=80&w=800'],
        ['id' => 'PRD-003', 'name' => 'King Fish (Surmai)', 'price' => 780.00, 'category' => 'Premium', 'desc' => 'The jewel of Andaman seafood', 'img' => 'https://images.unsplash.com/photo-1534604973900-c41ab4c5e638?q=80&w=800'],
        ['id' => 'PRD-004', 'name' => 'Mud Crabs', 'price' => 850.00, 'category' => 'Mangrove', 'desc' => 'Fresh live crabs', 'img' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800']
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO products (id, seller_id, name, category, price, stock, status, image_url, description) VALUES (?, ?, ?, ?, ?, 100, 'ACTIVE', ?, ?)");
    foreach ($products as $p) {
        $stmt->execute([$p['id'], $sellerId, $p['name'], $p['category'], $p['price'], $p['img'], $p['desc']]);
    }
    
    echo "Products Seeded\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
