<?php
require 'db.php';
$db = getDB();
print_r($db->query('SELECT id, name, zone_type, parent_id FROM maritime_territories')->fetchAll(PDO::FETCH_ASSOC));
?>
