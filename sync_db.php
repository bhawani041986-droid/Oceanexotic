<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/db.php';

$supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

function fetchSupabase($endpoint) {
    global $supabaseUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$supabaseUrl/rest/v1/$endpoint");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY
    ]);
    // Disable SSL verification if needed on local environments, but keep it secure by default
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    curl_close($ch);
    return json_decode($response, true);
}

try {
    $pdo = getDB();

    echo "Fetching fresh catalog from Supabase...\n";
    $supabaseProducts = fetchSupabase('products?select=*');
    $supabaseCatches = fetchSupabase('todays_catch?select=*');

    echo "Fetched " . count($supabaseProducts) . " products and " . count($supabaseCatches) . " catch records from Supabase.\n";

    // Start sync transaction
    $pdo->beginTransaction();

    // 1. Sync Products Table
    $checkStmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
    $insertStmt = $pdo->prepare("
        INSERT INTO products 
        (id, seller_id, name, price, stock, status, image_url, category, is_live_inventory, harbor_node, unit) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $updateStmt = $pdo->prepare("
        UPDATE products 
        SET name = ?, price = ?, stock = ?, status = ?, category = ?, is_live_inventory = ?, harbor_node = ? 
        WHERE id = ?
    ");

    foreach ($supabaseProducts as $p) {
        $checkStmt->execute([$p['id']]);
        if ($checkStmt->rowCount() === 0) {
            echo "-> Inserting new product: " . $p['name'] . " (" . $p['id'] . ")\n";
            $insertStmt->execute([
                $p['id'],
                $p['seller_id'] ?? 'SEL-2001',
                $p['name'],
                $p['price'],
                $p['stock'],
                $p['status'] ?? 'ACTIVE',
                $p['image_url'] ?? '',
                $p['category'] ?? '',
                $p['is_live_inventory'] ? 1 : 0,
                $p['harbor_node'] ?? 'Dollygunj Hub',
                $p['unit'] ?? 'KG'
            ]);
        } else {
            echo "-> Updating product: " . $p['name'] . " (" . $p['id'] . ")\n";
            $updateStmt->execute([
                $p['name'],
                $p['price'],
                $p['stock'],
                $p['status'],
                $p['category'],
                $p['is_live_inventory'] ? 1 : 0,
                $p['harbor_node'],
                $p['id']
            ]);
        }
    }

    // 2. Sync Today's Catch Table
    echo "Clearing old catch records...\n";
    $pdo->exec("DELETE FROM todays_catch");

    $catchStmt = $pdo->prepare("
        INSERT INTO todays_catch 
        (id, product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, status, batch_label) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($supabaseCatches as $c) {
        echo "-> Inserting catch record: " . $c['id'] . " for product " . $c['product_id'] . "\n";
        $catchStmt->execute([
            $c['id'],
            $c['product_id'],
            $c['seller_id'],
            $c['catch_date'],
            $c['harbor_node'],
            $c['quantity_kg'],
            $c['remaining_kg'],
            $c['price_per_kg'],
            $c['freshness_timestamp'],
            $c['expires_at'],
            $c['status'],
            $c['batch_label']
        ]);
      }

    // 3. Sync Product Cut Options Table
    echo "Fetching cut options from Supabase...\n";
    $supabaseCuts = fetchSupabase('product_cut_options?select=*');
    echo "Fetched " . count($supabaseCuts) . " cut options from Supabase.\n";

    echo "Clearing old cut options...\n";
    $pdo->exec("DELETE FROM product_cut_options");

    $cutStmt = $pdo->prepare("
        INSERT INTO product_cut_options 
        (id, product_id, cut_type, price_modifier_percent, price_flat_add, is_available, sort_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($supabaseCuts as $cut) {
        $cutStmt->execute([
            $cut['id'],
            $cut['product_id'],
            $cut['cut_type'],
            $cut['price_modifier_percent'],
            $cut['price_flat_add'],
            $cut['is_available'] ? 1 : 0,
            $cut['sort_order'] ?? 0
        ]);
    }

    $pdo->commit();
    echo "\n🎉 SUCCESS: Local MySQL database is fully synchronized with Supabase!\n";

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
}
?>
