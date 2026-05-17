<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
$res = $c->query("SELECT tc.*, p.name FROM todays_catch tc JOIN products p ON p.id = tc.product_id WHERE tc.catch_date = CURDATE() AND p.id IN ('PRD-KBT-01', 'PRD-LOB-01', 'PRD-TGR-05')");
$rows = [];
while($row = $res->fetch_assoc()) $rows[] = $row;
echo json_encode($rows, JSON_PRETTY_PRINT);
?>
