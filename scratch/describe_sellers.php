<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
$res = $c->query('DESCRIBE sellers');
$rows = [];
while($row = $res->fetch_assoc()) $rows[] = $row;
echo json_encode($rows, JSON_PRETTY_PRINT);
?>
