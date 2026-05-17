<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Global Settlement & Fleet Performance Statistics
$response = [
    "status" => "success",
    "revenue" => 42650.00,
    "growth" => 12.5,
    "activeProducts" => 84,
    "newProducts" => 4,
    "customers" => 1240,
    "customerGrowth" => 18,
    "performance" => 98.2,
    "perfTrend" => -0.4,
    "recentOrders" => [
        [
            "id" => "ORD-9982",
            "product" => "Atlantic Bluefin Tuna",
            "customer" => "Captain Morgan",
            "total" => 128.00,
            "status" => "PENDING",
            "timestamp" => "2026-05-09 10:24:00"
        ],
        [
            "id" => "ORD-9981",
            "product" => "Norwegian King Crab",
            "customer" => "Arctic Fresh",
            "total" => 240.00,
            "status" => "PREPARING",
            "timestamp" => "2026-05-09 10:14:00"
        ],
        [
            "id" => "ORD-9980",
            "product" => "Japanese Scallops",
            "customer" => "Pacific Traders",
            "total" => 85.50,
            "status" => "SHIPPED",
            "timestamp" => "2026-05-09 09:24:00"
        ]
    ]
];

echo json_encode($response);
?>
