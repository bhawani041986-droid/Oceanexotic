<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();

    // 1. Seed a Default Seller
    $pdo->exec("INSERT IGNORE INTO sellers (id, name, email, rating, status) 
                VALUES ('SEL-001', 'Andaman Deep Sea Fleet', 'fleet@andaman.com', 4.9, 'ACTIVE')");

    // 2. Clear Existing Products for Clean Seed
    $pdo->exec("DELETE FROM products");

    // 3. Andaman Fish Data
    $products = [
        [
            'id' => 'PRD-RED-01',
            'seller_id' => 'SEL-001',
            'name' => 'Red Snapper (Lal Fish)',
            'category' => 'FIN-FISH',
            'price' => 650.00,
            'stock' => 500.0,
            'image_url' => '/uploads/optimized/public-icons-red-snapper.webp',
            'description' => 'Freshly caught from the Andaman coral reefs. Firm texture and sweet flavor.'
        ],
        [
            'id' => 'PRD-KNG-02',
            'seller_id' => 'SEL-001',
            'name' => 'Kingfish (Surmai)',
            'category' => 'FIN-FISH',
            'price' => 850.00,
            'stock' => 300.0,
            'image_url' => '/uploads/optimized/public-icons-kingfish.webp',
            'description' => 'Premium steaks, rich in Omega-3. The pride of Port Blair markets.'
        ],
        [
            'id' => 'PRD-POM-03',
            'seller_id' => 'SEL-001',
            'name' => 'White Pomfret',
            'category' => 'FIN-FISH',
            'price' => 1200.00,
            'stock' => 150.0,
            'image_url' => '/uploads/optimized/public-icons-white-pomfret.webp',
            'description' => 'Butter-soft texture. Perfect for steaming or pan-frying.'
        ],
        [
            'id' => 'PRD-GRP-04',
            'seller_id' => 'SEL-001',
            'name' => 'Grouper (Reef Cod)',
            'category' => 'FIN-FISH',
            'price' => 550.00,
            'stock' => 450.0,
            'image_url' => '/uploads/optimized/public-icons-grouper.webp',
            'description' => 'Sustainably sourced reef fish. Ideal for curry and grilling.'
        ],
        [
            'id' => 'PRD-TGR-05',
            'seller_id' => 'SEL-001',
            'name' => 'Tiger Prawns (Jumbo)',
            'category' => 'SHELLFISH',
            'price' => 950.00,
            'stock' => 200.0,
            'image_url' => '/uploads/optimized/public-icons-tiger-prawns.webp',
            'description' => 'Wild-caught jumbo prawns. Meat prime and succulent.'
        ],
        [
            'id' => 'PRD-MUD-06',
            'seller_id' => 'SEL-001',
            'name' => 'Andaman Mud Crab',
            'category' => 'SHELLFISH',
            'price' => 1400.00,
            'stock' => 80.0,
            'image_url' => '/uploads/optimized/public-icons-mud-cram.webp',
            'description' => 'Live mud crabs from the Havelock mangroves. Extremely sweet meat.'
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO products (id, seller_id, name, category, price, stock, status, image_url, description) 
                           VALUES (:id, :seller_id, :name, :category, :price, :stock, 'ACTIVE', :image_url, :description)");

    foreach ($products as $p) {
        $stmt->execute($p);
    }

    echo json_encode(["status" => "success", "message" => "Andaman Marketplace Seeded with Live Inventory."]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
