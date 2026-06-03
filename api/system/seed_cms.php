<?php
header("Content-Type: application/json");
require_once '../../db.php';

try {
    $pdo = getDB();
    
    // Clear existing content to prevent duplicates
    $pdo->exec("DELETE FROM cms_content");

    $dummyData = [
        [
            'title' => 'Arctic Harvest: King Crab Season',
            'type' => 'BANNER',
            'status' => 'PUBLISHED',
            'sector' => 'GLOBAL',
            'image_url' => 'https://images.unsplash.com/photo-1551970634-747846a548cb?auto=format&fit=crop&q=80',
            'metadata' => null
        ],
        [
            'title' => 'Bluefin Saku: Premium Grade Directive',
            'type' => 'BANNER',
            'status' => 'PUBLISHED',
            'sector' => 'PACIFIC',
            'image_url' => 'https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80',
            'metadata' => null
        ],
        [
            'title' => 'Summer Seafood Festival Promo',
            'type' => 'PROMO',
            'status' => 'PUBLISHED',
            'sector' => 'GLOBAL',
            'image_url' => 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80',
            'metadata' => null
        ],
        [
            'title' => 'Privacy Protocol v2.4 (Maritime Standard)',
            'type' => 'LEGAL',
            'status' => 'PUBLISHED',
            'sector' => 'LEGAL',
            'image_url' => '',
            'metadata' => null
        ],
        [
            'title' => 'Lobster Tail Flash Harvest',
            'type' => 'PROMO',
            'status' => 'DRAFT',
            'sector' => 'ANDAMAN',
            'image_url' => 'https://images.unsplash.com/photo-1553618551-fba68c8b4df7?auto=format&fit=crop&q=80',
            'metadata' => null
        ],
        [
            'title' => 'Pan-Seared King Salmon',
            'type' => 'RECIPE',
            'status' => 'PUBLISHED',
            'sector' => 'CULINARY',
            'image_url' => 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80',
            'metadata' => json_encode(['difficulty' => 'Medium', 'time' => '25m'])
        ],
        [
            'title' => 'Garlic Butter Scallops',
            'type' => 'RECIPE',
            'status' => 'PUBLISHED',
            'sector' => 'CULINARY',
            'image_url' => 'https://images.unsplash.com/photo-1626074960533-3d6d034945d8?auto=format&fit=crop&q=80',
            'metadata' => json_encode(['difficulty' => 'Easy', 'time' => '15m'])
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO cms_content (title, type, status, sector, image_url, metadata) VALUES (?, ?, ?, ?, ?, ?)");
    
    foreach ($dummyData as $item) {
        $stmt->execute([
            $item['title'],
            $item['type'],
            $item['status'],
            $item['sector'],
            $item['image_url'],
            $item['metadata']
        ]);
    }

    echo json_encode(["status" => "success", "message" => "CMS Registry Seeded with High-Fidelity Data."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
