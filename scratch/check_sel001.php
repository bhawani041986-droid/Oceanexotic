<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
$res = $c->query("SELECT id FROM sellers WHERE id = 'SEL-001'");
echo json_encode($res->fetch_assoc());
?>
