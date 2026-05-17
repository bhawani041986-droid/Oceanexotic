<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
if ($c->connect_error) {
    die("Connection failed: " . $c->connect_error);
}

$seller_id = 'SEL-USR-1778761853233'; // Rig Fishing Haddo

// 1. Prepare Products Data
$products = [
    [
        'id' => 'PRD-KBT-01',
        'name' => 'Khatta Bhangdi',
        'category' => 'FIN-FISH',
        'price' => 200.00,
        'image_url' => '/uploads/optimized/public-icons-mackerel.webp',
        'description' => 'Fresh Indian Mackerel (Khatta Bhangdi). Excellent for frying or curry. High Omega-3 content.',
        'harbor_node' => 'Haddo Harbor',
        'unit' => 'kg'
    ],
    [
        'id' => 'PRD-LOB-01',
        'name' => 'Andaman King Lobster',
        'category' => 'SHELLFISH',
        'price' => 2500.00,
        'image_url' => '/uploads/optimized/public-icons-spiny-lobster.webp',
        'description' => 'Premium King Lobster from the deep reefs of Andaman. Sweet, succulent meat.',
        'harbor_node' => 'Junglighat Harbor',
        'unit' => 'kg'
    ],
    [
        'id' => 'PRD-TGR-05',
        'name' => 'Wild Tiger Prawns (Jumbo)',
        'category' => 'SHELLFISH',
        'price' => 950.00,
        'image_url' => '/uploads/optimized/public-icons-tiger-prawns.webp',
        'description' => 'Massive Wild Tiger Prawns. Firm texture and rich flavor. Perfect for grilling.',
        'harbor_node' => 'Phoenix Bay Harbor',
        'unit' => 'kg'
    ]
];

foreach ($products as $p) {
    // Check if product exists
    $check = $c->query("SELECT id FROM products WHERE id = '$p[id]'");
    if ($check->num_rows > 0) {
        // Update
        $sql = "UPDATE products SET 
                seller_id = '$seller_id',
                name = '" . $c->real_escape_string($p['name']) . "',
                category = '$p[category]',
                price = $p[price],
                image_url = '$p[image_url]',
                description = '" . $c->real_escape_string($p['description']) . "',
                harbor_node = '$p[harbor_node]',
                is_live_inventory = 1,
                unit = '$p[unit]',
                status = 'ACTIVE'
                WHERE id = '$p[id]'";
    } else {
        // Insert
        $sql = "INSERT INTO products (id, seller_id, name, category, price, image_url, description, harbor_node, is_live_inventory, unit, status) 
                VALUES ('$p[id]', '$seller_id', '" . $c->real_escape_string($p['name']) . "', '$p[category]', $p[price], '$p[image_url]', '" . $c->real_escape_string($p['description']) . "', '$p[harbor_node]', 1, '$p[unit]', 'ACTIVE')";
    }
    
    if (!$c->query($sql)) {
        echo "Error on product $p[id]: " . $c->error . "\n";
    } else {
        echo "Synchronized product $p[id].\n";
    }
}

// 2. Insert into todays_catch
$today = date('Y-m-d');
$now = date('Y-m-d H:i:s');
$expiry = date('Y-m-d 23:59:59');

$c->query("DELETE FROM todays_catch WHERE catch_date = '$today' AND product_id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");

$catches = [
    ['PRD-KBT-01', $seller_id, 'Haddo Harbor', 10, 10, 200.00, 'MORNING'],
    ['PRD-LOB-01', $seller_id, 'Junglighat Harbor', 4, 4, 2500.00, 'MORNING'],
    ['PRD-TGR-05', $seller_id, 'Phoenix Bay Harbor', 10, 10, 950.00, 'MORNING']
];

foreach ($catches as $catch) {
    $sql = "INSERT INTO todays_catch (product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status) 
            VALUES ('$catch[0]', '$catch[1]', '$today', '$catch[2]', $catch[3], $catch[4], $catch[5], '$now', '$expiry', '$catch[6]', 'ACTIVE')";
    if (!$c->query($sql)) {
        echo "Error on catch $catch[0]: " . $c->error . "\n";
    } else {
        echo "Inserted today's catch for $catch[0].\n";
    }
}

// 3. Cut Options
$c->query("DELETE FROM product_cut_options WHERE product_id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");

$cutOptions = [
    ['PRD-KBT-01', 'WHOLE', 0, 0, 1, 10, 1],
    ['PRD-KBT-01', 'CLEANED', 10, 0, 1, 10, 2],
    ['PRD-KBT-01', 'CURRY_CUT', 15, 0, 1, 10, 3],
    ['PRD-KBT-01', 'STEAK_CUT', 20, 0, 1, 10, 4],
    
    ['PRD-LOB-01', 'WHOLE', 0, 0, 1, 4, 1],
    ['PRD-LOB-01', 'CLEANED', 5, 100, 1, 4, 2],
    
    ['PRD-TGR-05', 'WHOLE', 0, 0, 1, 10, 1],
    ['PRD-TGR-05', 'CLEANED', 10, 0, 1, 10, 2],
    ['PRD-TGR-05', 'HEAD_OFF', 20, 0, 1, 10, 3]
];

foreach ($cutOptions as $opt) {
    $sql = "INSERT INTO product_cut_options (product_id, cut_type, price_modifier_percent, price_flat_add, is_available, stock_kg, sort_order) 
            VALUES ('$opt[0]', '$opt[1]', $opt[2], $opt[3], $opt[4], $opt[5], $opt[6])";
    $c->query($sql);
}

echo "Demo seeding complete. Check http://localhost:3002/customer/products to view live inventory.\n";
?>
