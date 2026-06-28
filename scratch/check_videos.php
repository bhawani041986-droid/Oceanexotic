<?php
$conn = new mysqli("localhost", "root", "", "ocean_fresh", 3307);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = $conn->query("SELECT * FROM marketplace_videos");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo "Video ID: " . $row['id'] . " | URL: " . $row['video_url'] . "\n";
    }
} else {
    echo "Query failed.\n";
}
$conn->close();
