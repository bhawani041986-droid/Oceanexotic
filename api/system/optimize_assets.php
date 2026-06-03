<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$root_dir = dirname(__FILE__, 3); // Goes from api/system/ -> FISH_MARKET root
$python_bin = $root_dir . DIRECTORY_SEPARATOR . "venv" . DIRECTORY_SEPARATOR . "Scripts" . DIRECTORY_SEPARATOR . "python.exe";
$script_path = $root_dir . DIRECTORY_SEPARATOR . "optimize_all.py";

if (!file_exists($python_bin)) {
    // Try global python
    $python_bin = "python";
}

// Execute script and capture output
$command = escapeshellcmd("$python_bin $script_path");
$output = [];
$return_var = -1;

// Change current working directory to project root so paths inside python resolve correctly
$old_cwd = getcwd();
chdir($root_dir);

exec($command . " 2>&1", $output, $return_var);

// Restore original directory
chdir($old_cwd);

if ($return_var === 0) {
    echo json_encode([
        "status" => "success",
        "message" => "Optimization pipeline executed successfully.",
        "output" => $output
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to run optimization pipeline.",
        "command" => $command,
        "return_code" => $return_var,
        "output" => $output
    ]);
}
?>
