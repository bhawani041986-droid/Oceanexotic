<?php
$c = @file_get_contents('http://localhost:8081/FISH_MARKET/api/products/detail.php?id=PRD-KBT-01');
if ($c === false) {
    $error = error_get_last();
    echo "Error: " . $error['message'];
} else {
    echo $c;
}
?>
