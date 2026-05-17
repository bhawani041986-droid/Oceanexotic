<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=fish_market', 'root', '');
    $stmt = $db->query('DESCRIBE user_addresses');
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . ' - ' . $row['Type'] . "\n";
    }
} catch(PDOException $e) {
    echo $e->getMessage();
}
?>
