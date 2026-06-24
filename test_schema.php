<?php require 'db.php'; print_r(getDB()->query('SELECT id, name, zone_type, parent_id, status FROM maritime_territories ORDER BY id DESC LIMIT 5')->fetchAll(PDO::FETCH_ASSOC));
