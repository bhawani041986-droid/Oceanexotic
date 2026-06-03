<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DELETE FROM products");
    $pdo->exec("DELETE FROM users WHERE role = 'SELLER'");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Debug Columns
    $colsStmt = $pdo->query("DESCRIBE products");
    $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN);

    // 3. Research-Based Andaman Fish Market Data
    $fishMarket = [
        ['name' => 'Red Snapper (Lal Machli)', 'price' => 580.00, 'category' => 'Reef Fish', 'desc' => 'High-quality reef catch, known for its sweet, firm white flesh.'],
        ['name' => 'King Fish (Surmai)', 'price' => 780.00, 'category' => 'Premium', 'desc' => 'The jewel of Andaman seafood. Perfect for steaks and traditional curries.'],
        ['name' => 'Yellowfin Tuna', 'price' => 380.00, 'category' => 'Deep Sea', 'desc' => 'Sustainably caught from the deep waters surrounding the archipelago.'],
        ['name' => 'Tiger Prawns (Jumbo)', 'price' => 1150.00, 'category' => 'Crustaceans', 'desc' => 'Extra large jumbo prawns harvested from the Sippighat coastal regions.'],
        ['name' => 'Mud Crabs (Live)', 'price' => 850.00, 'category' => 'Mangrove', 'desc' => 'Fresh live crabs harvested from the mangrove roots of South Andaman.'],
        ['name' => 'Black Pomfret', 'price' => 620.00, 'category' => 'Coastal', 'desc' => 'A local favorite, perfect for pan-frying with island spices.'],
        ['name' => 'Barracuda', 'price' => 450.00, 'category' => 'Wild', 'desc' => 'Firm, flavorful meat with a distinct oceanic profile.'],
        ['name' => 'Grouper (Rock Cod)', 'price' => 480.00, 'category' => 'Reef Fish', 'desc' => 'Delicate white meat, excellent for steaming or grilling.'],
    ];

    $images = [
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
        "https://images.unsplash.com/photo-1534604973900-c41ab4c5e638?q=80&w=800",
        "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?q=80&w=800",
        "https://images.unsplash.com/photo-1559113202-c916b8e44373?q=80&w=800",
        "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800",
    ];

    // 4. Create One Seller per Port Blair Location
    $stmt = $pdo->query("SELECT id, name FROM maritime_territories WHERE parent_id IN (SELECT id FROM maritime_territories WHERE name = 'Port Blair') AND status = 'ACTIVE'");
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sellerInsert = $pdo->prepare("INSERT INTO users (id, name, email, password, role, territory_id) VALUES (?, ?, ?, ?, 'SELLER', ?)");
    // Insert Products
    $productInsert = $pdo->prepare("INSERT INTO products (id, seller_id, name, category, price, stock, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $count = 0;
    foreach ($locations as $loc) {
        $sellerId = "SEL-" . strtoupper(substr(str_replace(' ', '', $loc['name']), 0, 4)) . "-" . sprintf("%03d", rand(1, 999));
        $sellerName = $loc['name'] . " Maritime Collective";
        $email = strtolower(str_replace(' ', '', $loc['name'])) . "@oceanfresh.in";
        
        $sellerInsert->execute([$sellerId, $sellerName, $email, password_hash('seller123', PASSWORD_DEFAULT), $loc['id']]);

        // Add 2-3 products for this seller
        $numProducts = rand(2, 3);
        $assignedFish = array_rand($fishMarket, $numProducts);
        
        foreach ((array)$assignedFish as $fishIdx) {
            $fish = $fishMarket[$fishIdx];
            $img = $images[array_rand($images)];
            $productInsert->execute([$fish['name'], $fish['price'], $fish['category'], $fish['desc'], $sellerId, $img]);
            $count++;
        }
    }

    echo json_encode([
        "status" => "success", 
        "message" => "Andaman Fish Market Data Integrated (V2).",
        "sellers_deployed" => count($locations),
        "products_listed" => $count
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage(),
        "columns" => $cols ?? []
    ]);
}
?>
