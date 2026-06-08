<?php
require_once 'db.php';

try {
    $pdo = getDB();
    $sql = "
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL,
  user_id VARCHAR(50) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  delivery_address text DEFAULT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  delivery_agent_name VARCHAR(255) DEFAULT NULL,
  delivery_agent_phone VARCHAR(50) DEFAULT NULL,
  shipping_method VARCHAR(100) DEFAULT 'STANDARD',
  tracking_number VARCHAR(100) DEFAULT NULL,
  estimated_delivery VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  delivery_area VARCHAR(100) DEFAULT 'Port Blair',
  is_pre_order int2 DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL,
  order_id INTEGER NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
";
    
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, 0);
    $pdo->exec($sql);
    
    echo json_encode(["status" => "success", "message" => "Orders tables created successfully"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
