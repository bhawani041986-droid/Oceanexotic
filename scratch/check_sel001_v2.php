<?php
$c = new mysqli('localhost', 'root', '', 'ocean_fresh', 3307);
$res = $c->query("SELECT * FROM sellers WHERE id = 'SEL-001'");
if (!$res) {
    echo "Query Error: " . $c->error;
} else {
    echo json_encode($res->fetch_assoc());
}
?>
