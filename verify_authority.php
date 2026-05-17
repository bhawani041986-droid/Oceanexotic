<?php
require_once 'db.php';

try {
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        echo "Commissioning Admiral-rank credentials...\n";
        $name = "Admiral Sovereign";
        $email = "admin@oceanfresh.com";
        $password = password_hash("AdminAdmiral2026!", PASSWORD_DEFAULT);
        $role = "admin";
        
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $password, $role]);
        echo "Admiral node established: $email\n";
    } else {
        echo "Admiral node already operational.\n";
    }
    
    // Ensure products table is seeded for the list.php
    require_once 'api/products/list.php';
    echo "Marketplace seeds verified.\n";

} catch (PDOException $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
}
?>
