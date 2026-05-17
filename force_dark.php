<?php
require_once 'db.php';

try {
    $pdo = getDB();
    $key = 'customerTheme';
    $value = json_encode('theme-midnight-deep');
    
    $stmt = $pdo->prepare("INSERT INTO marketplace_settings (setting_key, setting_value) 
                           VALUES (:key, :value) 
                           ON DUPLICATE KEY UPDATE setting_value = :value2");
    
    // 1. Force Midnight Deep Theme
    $stmt->execute([
        'key' => 'customerTheme',
        'value' => json_encode('theme-midnight-deep'),
        'value2' => json_encode('theme-midnight-deep')
    ]);

    // 2. Force OceanFresh Identity
    $stmt->execute([
        'key' => 'marketplaceName',
        'value' => json_encode('OceanFresh Global'),
        'value2' => json_encode('OceanFresh Global')
    ]);

    echo "Sovereign Command Executed: Customer Theme Synchronized to Midnight Deep.";
} catch (PDOException $e) {
    echo "Governance Failure: " . $e->getMessage();
}
?>
