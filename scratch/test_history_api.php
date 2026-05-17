<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8081/FISH_MARKET/api/orders/customer_history.php?userId=USR-1778761853698");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);
if(curl_error($ch)) {
    echo 'Curl error: ' . curl_error($ch);
}
curl_close($ch);
echo "API response:\n" . $output;
?>
