<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
$id = 'DEMO-' . time();
$sql = "INSERT INTO todays_catch (id, product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status) 
        VALUES ('$id', 'PRD-KBT-01', 'SEL-USR-1778761853233', CURDATE(), 'Haddo Harbor', 10, 10, 200, NOW(), NOW() + INTERVAL 1 DAY, 'MORNING', 'ACTIVE')";
if ($c->query($sql)) {
    echo "Success: $id\n";
} else {
    echo "Error: " . $c->error . "\n";
}
?>
