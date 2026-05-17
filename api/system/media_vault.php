<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$optimized_dir = "../../public/uploads/optimized";
$thumbnails_dir = "../../public/uploads/thumbnails";

if (!is_dir($optimized_dir)) {
    echo json_encode(["status" => "error", "message" => "Optimized directory missing"]);
    exit;
}

$files = scandir($optimized_dir);
$assets = [];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    if (pathinfo($file, PATHINFO_EXTENSION) === 'webp') {
        $stats_file = $optimized_dir . "/" . $file . ".json";
        $metadata = [];
        if (file_exists($stats_file)) {
            $metadata = json_decode(file_get_contents($stats_file), true);
        }
        
        $assets[] = [
            "name" => $file,
            "url" => "/uploads/optimized/" . $file,
            "size_kb" => round(filesize($optimized_dir . "/" . $file) / 1024, 1),
            "timestamp" => filemtime($optimized_dir . "/" . $file),
            "metadata" => $metadata
        ];
    }
}

// Sort by newest first
usort($assets, function($a, $b) {
    return $b['timestamp'] - $a['timestamp'];
});

echo json_encode([
    "status" => "success",
    "total" => count($assets),
    "assets" => $assets
]);
?>
