<?php
function fetch_url($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [
        'code' => $http_code,
        'body' => json_decode($response, true) ?? $response
    ];
}

$id = "USR-1778761853605";

$result = [
    'profile' => fetch_url("http://127.0.0.1:8081/FISH_MARKET/api/user/profile.php?id=$id"),
    'orders' => fetch_url("http://127.0.0.1:8081/FISH_MARKET/api/orders/customer_history.php?userId=$id"),
    'addresses' => fetch_url("http://127.0.0.1:8081/FISH_MARKET/api/user/addresses.php?userId=$id")
];

file_put_contents("C:/xampp/htdocs/FISH_MARKET/check_user_result.json", json_encode($result, JSON_PRETTY_PRINT));
echo "SUCCESS_WRITTEN";
