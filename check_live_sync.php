<?php
require_once 'db.php';
$pdo = getDB();

echo "=== DATABASE TIME DIAGNOSTICS ===\n";
$stmt = $pdo->query("SELECT CURDATE() as curdate, NOW() as now, @@global.time_zone as global_tz, @@session.time_zone as session_tz");
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\n=== PHP TIME ===\n";
echo "PHP date('Y-m-d H:i:s'): " . date('Y-m-d H:i:s') . "\n";
echo "PHP date_default_timezone_get(): " . date_default_timezone_get() . "\n";

echo "\n=== TODAYS_CATCH ENTRIES ===\n";
$stmt = $pdo->query("SELECT id, product_id, catch_date, harbor_node, freshness_timestamp, expires_at, status, remaining_kg FROM todays_catch");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
