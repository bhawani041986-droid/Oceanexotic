<?php
$conn = new mysqli("localhost", "root", "", "ocean_fresh", 3307);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = $conn->query("SELECT * FROM marketplace_settings WHERE `setting_key` = 'HOME_SECTION_ORDER'");
if ($result && $row = $result->fetch_assoc()) {
    echo "HOME_SECTION_ORDER in database: " . $row['setting_value'] . "\n";
} else {
    echo "HOME_SECTION_ORDER key not found in database.\n";
}
$conn->close();
