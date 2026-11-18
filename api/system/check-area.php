<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

$area = strtolower(trim($_GET['area'] ?? ''));

// All Andaman & Port Blair / Sri Vijaya Puram addresses are serviceable
$deliverable = true;
if (!empty($area)) {
    // If clearly non-Andaman address or mainland
    $isOutside = preg_match('/(delhi|mumbai|kolkata|bangalore|chennai|hyderabad|pune|ahmedabad|kerala|punjab|bihar)/i', $area);
    if ($isOutside && !preg_match('/(andaman|port\s*blair|vijaya|chatham)/i', $area)) {
        $deliverable = false;
    }
}

echo json_encode([
    "deliverable" => $deliverable,
    "method" => "area_name",
    "distanceKm" => null,
    "estimatedMinutes" => 35,
    "delivery_charge" => 0,
    "minimum_order" => 0,
    "allowed_slots" => ["TODAY_AM", "TODAY_PM", "TOMORROW"],
    "message" => $deliverable ? "Delivery available in your area!" : "Coming soon to your area.",
    "hubName" => "Port Blair Live Hub",
    "areaQueried" => $area
]);
