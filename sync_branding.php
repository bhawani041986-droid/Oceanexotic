<?php
require_once 'db.php';

try {
    $pdo = getDB();
    
    $settings = [
        'marketplaceName' => 'OceanExotic Global',
        'email' => 'dispatch@oceanexotic.com',
        'instagram' => '@oceanexotic_global',
        'youtube' => 'youtube.com/@oceanexotic'
    ];

    foreach ($settings as $key => $value) {
        $stmt = $pdo->prepare("INSERT INTO marketplace_settings (setting_key, setting_value) 
                               VALUES (:key, :value) 
                               ON DUPLICATE KEY UPDATE setting_value = :value2");
        $jsonValue = json_encode($value);
        $stmt->execute([
            'key' => $key,
            'value' => $jsonValue,
            'value2' => $jsonValue
        ]);
    }

    echo "Sovereign Database Synchronized to OceanExotic Global.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
