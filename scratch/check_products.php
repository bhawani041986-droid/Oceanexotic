<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
if ($c->connect_error) {
    die("Connection failed: " . $c->connect_error);
}

$search = $c->query("SELECT * FROM products WHERE name LIKE '%Khatta Bhangdi%' OR name LIKE '%Lobster%' OR name LIKE '%Prawns%'");
$results = [];
while ($row = $search->fetch_assoc()) {
    $results[] = $row;
}
echo json_encode($results, JSON_PRETTY_PRINT);
?>
