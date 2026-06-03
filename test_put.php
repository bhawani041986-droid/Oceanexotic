<?php
function testUrl($url, $method = 'GET', $data = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    }
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ["code" => $code, "response" => $response];
}

echo "=== Testing http://127.0.0.1:8081/FISH_MARKET/api/seller/products (PUT) ===\n";
$data = [
    "id" => "PRD-TGR-05",
    "seller_id" => "SEL-USR-1778761853233",
    "name" => "Tiger Prawns (Tested)",
    "category" => "SHELLFISH ELITE",
    "price" => "650",
    "stock" => "50",
    "is_live_inventory" => 1,
    "harbor_node" => "Aberdeen Bazaar Jetty",
    "catch_date" => "2026-05-18",
    "batch_label" => "MORNING",
    "catch_time" => "06:15",
    "status" => "ACTIVE"
];
print_r(testUrl("http://127.0.0.1:8081/FISH_MARKET/api/seller/products", "PUT", $data));

echo "\n=== Testing http://127.0.0.1:8081/FISH_MARKET/api/seller/products.php (PUT) ===\n";
print_r(testUrl("http://127.0.0.1:8081/FISH_MARKET/api/seller/products.php", "PUT", $data));
?>
