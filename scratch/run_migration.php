<?php
require_once __DIR__ . '/../db.php';
$sql = file_get_contents(__DIR__ . '/../database/live_marketplace_migration.sql');
// Remove comments, split and execute
$lines = explode("\n", $sql);
$cleanLines = array_filter($lines, fn($l) => !preg_match('/^\s*--/', $l));
$clean = implode("\n", $cleanLines);
$statements = array_filter(array_map('trim', explode(';', $clean)));
$ok = 0; $fail = 0;
foreach ($statements as $stmt) {
    if (strlen($stmt) < 5) continue;
    try {
        $pdo->exec($stmt);
        $ok++;
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        if (strpos($msg, 'Duplicate entry') !== false || strpos($msg, '1060') !== false) {
            $ok++; // already exists, fine
        } else {
            $fail++;
            echo "WARN: " . substr($msg, 0, 150) . "\n";
        }
    }
}
echo "\nMigration complete: {$ok} OK, {$fail} failed.\n";
// Verify
$tables = $pdo->query("SHOW TABLES LIKE 'todays_catch'")->fetchAll();
echo "todays_catch table: " . (count($tables) > 0 ? "EXISTS ✓" : "MISSING ✗") . "\n";
$tables2 = $pdo->query("SHOW TABLES LIKE 'product_cut_options'")->fetchAll();
echo "product_cut_options table: " . (count($tables2) > 0 ? "EXISTS ✓" : "MISSING ✗") . "\n";
$count = $pdo->query("SELECT COUNT(*) FROM todays_catch")->fetchColumn();
echo "Todays catch records: {$count}\n";
$cuts = $pdo->query("SELECT COUNT(*) FROM product_cut_options")->fetchColumn();
echo "Cut option records: {$cuts}\n";
?>
