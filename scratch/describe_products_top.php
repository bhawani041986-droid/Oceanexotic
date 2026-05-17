<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
$res = $c->query('DESCRIBE products');
$rows = [];
while($row = $res->fetch_assoc()) $rows[] = $row;
echo json_encode(array_slice($rows, 0, 10), JSON_PRETTY_PRINT);
?>
