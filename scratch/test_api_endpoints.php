<?php
$urls = [
    "http://localhost:8081/api/orders/customer_history.php?userId=1",
    "http://localhost:8081/api/orders/customer_history.php?userId=USR-TOWG2LBPP",
    "http://localhost:8081/api/orders/customer_history.php?userId=USR-1778761853251"
];

foreach ($urls as $url) {
    echo "Testing URL: $url\n";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "Status: $httpCode\n";
    echo "Response: $response\n\n";
    curl_close($ch);
}
?>
