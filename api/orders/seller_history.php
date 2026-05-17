<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Fleet Ledger: Merchant Fulfillment History Registry
$response = [
    "status" => "success",
    "orders" => [
        [
            "id" => "ORD-9982",
            "product" => "Atlantic Bluefin Tuna",
            "customer" => "Captain Morgan",
            "total" => "$128.00",
            "status" => "PENDING",
            "date" => "2026-05-09 10:24:00",
            "logistics" => "OPTIMAL"
        ],
        [
            "id" => "ORD-9981",
            "product" => "Norwegian King Crab",
            "customer" => "Arctic Fresh",
            "total" => "$240.00",
            "status" => "SHIPPED",
            "date" => "2026-05-09 09:14:00",
            "logistics" => "VERIFIED"
        ],
        [
            "id" => "ORD-9980",
            "product" => "Japanese Scallops",
            "customer" => "Pacific Traders",
            "total" => "$85.50",
            "status" => "DELIVERED",
            "date" => "2026-05-08 14:24:00",
            "logistics" => "VERIFIED"
        ]
    ]
];

echo json_encode($response);
?>
