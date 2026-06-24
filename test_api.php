<?php
$data = array("product_id"=>"catla-carp", "seller_id"=>"SEL-001", "user_id"=>"GUEST", "user_name"=>"Citizen", "rating"=>4, "comment"=>"PHP Test");
$options = array("http" => array("header"  => "Content-type: application/json\r\n", "method"  => "POST", "content" => json_encode($data)));
$context  = stream_context_create($options);
$result = file_get_contents("http://localhost/api/reviews/create.php", false, $context);
echo $result;
?>
