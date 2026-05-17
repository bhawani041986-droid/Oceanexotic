<?php
$host = '127.0.0.1';
$port = '3307';
$user = 'root';
$pass = '';
$db = 'ocean_fresh';

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("❌ Sovereign Spine Connection Failure: " . $conn->connect_error);
}

echo "⚓️ OCEANFRESH ASSET SYNCHRONIZATION AUDIT\n";
echo "==========================================\n\n";

// --- AUDIT PRODUCT REGISTRY ---
echo "--- [PRODUCT REGISTRY] ---\n";
$res = $conn->query("SELECT id, name, image_url FROM products");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $status = (strpos($row['image_url'], '/uploads/') !== false) ? "✅ HARDENED" : "⚠️ MOCK/URL";
        echo "ID: {$row['id']} | Name: {$row['name']} | Path: {$row['image_url']} | Status: $status\n";
    }
} else {
    echo "No products found or registry error.\n";
}

echo "\n--- [IDENTITY REGISTRY] ---\n";
$res = $conn->query("SELECT id, name, avatar_url FROM users");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $status = (strpos($row['avatar_url'], '/uploads/') !== false) ? "✅ HARDENED" : "⚠️ MOCK/URL";
        echo "ID: {$row['id']} | Name: {$row['name']} | Path: {$row['avatar_url']} | Status: $status\n";
    }
} else {
    echo "No users found or registry error.\n";
}

$conn->close();
?>
