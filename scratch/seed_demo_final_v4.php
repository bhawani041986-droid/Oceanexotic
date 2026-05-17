<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
if ($c->connect_error) {
    die("Connection failed: " . $c->connect_error);
}

$seller_id = 'SEL-USR-1778761853233';

// 1. Products
$products = [
    ['PRD-KBT-01', 'Khatta Bhangdi', 'FIN-FISH', 200.00, '/uploads/optimized/public-icons-mackerel.webp', 'Fresh Indian Mackerel (Khatta Bhangdi).', 'Haddo Harbor'],
    ['PRD-LOB-01', 'Andaman King Lobster', 'SHELLFISH', 2500.00, '/uploads/optimized/public-icons-spiny-lobster.webp', 'Premium King Lobster.', 'Junglighat Harbor'],
    ['PRD-TGR-05', 'Wild Tiger Prawns (Jumbo)', 'SHELLFISH', 950.00, '/uploads/optimized/public-icons-tiger-prawns.webp', 'Massive Wild Tiger Prawns.', 'Phoenix Bay Harbor']
];

foreach ($products as $p) {
    $name = $c->real_escape_string($p[1]);
    $desc = $c->real_escape_string($p[5]);
    $c->query("INSERT INTO products (id, seller_id, name, category, price, image_url, description, harbor_node, is_live_inventory, unit, status) 
               VALUES ('$p[0]', '$seller_id', '$name', '$p[2]', $p[3], '$p[4]', '$desc', '$p[6]', 1, 'kg', 'ACTIVE')
               ON DUPLICATE KEY UPDATE seller_id='$seller_id', name='$name', category='$p[2]', price=$p[3], image_url='$p[4]', description='$desc', harbor_node='$p[6]', is_live_inventory=1");
}

// 2. Today's Catch
$c->query("DELETE FROM todays_catch WHERE catch_date = CURDATE() AND product_id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");
foreach ($products as $p) {
    $id = 'CTH-' . $p[0] . '-' . uniqid();
    $c->query("INSERT INTO todays_catch (id, product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status) 
               VALUES ('$id', '$p[0]', '$seller_id', CURDATE(), '$p[6]', 10, 10, $p[3], NOW(), NOW() + INTERVAL 1 DAY, 'MORNING', 'ACTIVE')");
}

// 3. Cut Options
$c->query("DELETE FROM product_cut_options WHERE product_id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");
$cuts = [
    ['PRD-KBT-01', 'WHOLE', 0, 0], ['PRD-KBT-01', 'CLEANED', 10, 0], ['PRD-KBT-01', 'CURRY_CUT', 15, 0],
    ['PRD-LOB-01', 'WHOLE', 0, 0], ['PRD-LOB-01', 'CLEANED', 5, 100],
    ['PRD-TGR-05', 'WHOLE', 0, 0], ['PRD-TGR-05', 'CLEANED', 10, 0]
];
foreach ($cuts as $cut) {
    $id = 'CUT-' . $cut[0] . '-' . $cut[1] . '-' . uniqid();
    $c->query("INSERT INTO product_cut_options (id, product_id, cut_type, price_modifier_percent, price_flat_add, is_available, stock_kg, sort_order) 
               VALUES ('$id', '$cut[0]', '$cut[1]', $cut[2], $cut[3], 1, 10, 0)");
}

echo "Seeding completed successfully.\n";
?>
