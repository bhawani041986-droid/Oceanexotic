<?php
require 'db.php';

echo "=== USER_ADDRESSES TABLE SCHEMA ===\n\n";
$stmt = $pdo->query('DESCRIBE user_addresses');
while($row = $stmt->fetch()) {
    echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Default'] . "\n";
}

echo "\n\n=== SAMPLE ADDRESS DATA ===\n\n";
$stmt = $pdo->query('SELECT * FROM user_addresses LIMIT 1');
$address = $stmt->fetch();
if ($address) {
    foreach ($address as $key => $value) {
        echo $key . ': ' . var_export($value, true) . "\n";
    }
} else {
    echo "No addresses found\n";
}
?>
