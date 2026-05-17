<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
if ($c->connect_error) {
    die("Connection failed: " . $c->connect_error);
}

// 1. Ensure "Andaman King Lobster" exists in products
$checkLobster = $c->query("SELECT id FROM products WHERE id = 'PRD-LOB-01'");
if ($checkLobster->num_rows == 0) {
    $c->query("INSERT INTO products (id, name, category, price, stock, status, image_url, description, harbor_node, unit) 
               VALUES ('PRD-LOB-01', 'Andaman King Lobster', 'SHELLFISH', 2500.00, 50.0, 'ACTIVE', '/uploads/optimized/lobster.webp', 'Premium king lobster from Andaman waters.', 'Junglighat Harbor', 'kg')");
    echo "Added Andaman King Lobster to products.\n";
}

// 2. Clear existing today's catch for these to avoid duplicates for the demo
$c->query("DELETE FROM todays_catch WHERE catch_date = CURDATE() AND product_id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");

// 3. Insert into todays_catch
$today = date('Y-m-d');
$now = date('Y-m-d H:i:s');
$expiry = date('Y-m-d 23:59:59');

$catches = [
    ['PRD-KBT-01', 'SEL-001', 'Haddo Harbor', 10, 10, 200.00, 'MORNING'],
    ['PRD-LOB-01', 'SEL-001', 'Junglighat Harbor', 4, 4, 2500.00, 'MORNING'],
    ['PRD-TGR-05', 'SEL-001', 'Phoenix Bay Harbor', 10, 10, 950.00, 'MORNING']
];

foreach ($catches as $catch) {
    $sql = "INSERT INTO todays_catch (product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status) 
            VALUES ('$catch[0]', '$catch[1]', '$today', '$catch[2]', $catch[3], $catch[4], $catch[5], '$now', '$expiry', '$catch[6]', 'ACTIVE')";
    if ($c->query($sql)) {
        echo "Inserted $catch[0] into todays_catch.\n";
    } else {
        echo "Error inserting $catch[0]: " . $c->error . "\n";
    }
}

// 4. Ensure Cut Options exist for these products
$cutOptions = [
    ['PRD-KBT-01', 'WHOLE', 0, 0, 1, 10, 1],
    ['PRD-KBT-01', 'CLEANED', 10, 0, 1, 10, 2],
    ['PRD-KBT-01', 'CURRY_CUT', 15, 0, 1, 10, 3],
    
    ['PRD-LOB-01', 'WHOLE', 0, 0, 1, 4, 1],
    ['PRD-LOB-01', 'CLEANED', 5, 50, 1, 4, 2],
    
    ['PRD-TGR-05', 'WHOLE', 0, 0, 1, 10, 1],
    ['PRD-TGR-05', 'CLEANED', 10, 0, 1, 10, 2],
    ['PRD-TGR-05', 'HEAD_OFF', 20, 0, 1, 10, 3]
];

// Clear existing cut options to avoid duplicates
$c->query("DELETE FROM product_cut_options WHERE product_id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");

foreach ($cutOptions as $opt) {
    $sql = "INSERT INTO product_cut_options (product_id, cut_type, price_modifier_percent, price_flat_add, is_available, stock_kg, sort_order) 
            VALUES ('$opt[0]', '$opt[1]', $opt[2], $opt[3], $opt[4], $opt[5], $opt[6])";
    if ($c->query($sql)) {
        echo "Inserted cut option $opt[1] for $opt[0].\n";
    } else {
        echo "Error inserting cut option: " . $c->error . "\n";
    }
}

echo "Seeding complete.\n";
?>
