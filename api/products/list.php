<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Global Maritime Harvest Registry
$response = [
    "status" => "success",
    "products" => [
        [
            "id" => "1",
            "name" => "Premium Bluefin Tuna",
            "price" => 85.00,
            "unit" => "kg",
            "image" => "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
            "sellerName" => "Pacific Prime",
            "category" => "Deep Sea",
            "freshness" => "FRESH CATCH",
            "deliveryTime" => "12h",
            "rating" => 4.9
        ],
        [
            "id" => "2",
            "name" => "King Crab Clusters",
            "price" => 120.00,
            "unit" => "box",
            "image" => "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800",
            "sellerName" => "Arctic Cold",
            "category" => "Crustaceans",
            "freshness" => "PREMIUM",
            "deliveryTime" => "24h",
            "rating" => 4.8
        ],
        [
            "id" => "3",
            "name" => "Mediterranean Sea Bass",
            "price" => 45.00,
            "unit" => "kg",
            "image" => "https://images.unsplash.com/photo-1534604973900-c41ab4c5e638?q=80&w=800",
            "sellerName" => "Aegean Catch",
            "category" => "Wild",
            "freshness" => "ORGANIC",
            "deliveryTime" => "18h",
            "rating" => 4.7
        ]
    ]
];

echo json_encode($response);
?>
