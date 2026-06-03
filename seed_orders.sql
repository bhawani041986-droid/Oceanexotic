USE ocean_fresh;

-- Ensure we have some test users and sellers just in case the API's joins require them
INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
('USR-1001', 'Captain Ahab', 'ahab@sea.com', '', 'CUSTOMER'),
('USR-1002', 'Nemo', 'nemo@nautilus.com', '', 'CUSTOMER'),
('SEL-2001', 'Andaman Fish Co', 'co@andaman.com', '', 'SELLER'),
('SEL-2002', 'Deep Sea Catch', 'catch@deepsea.com', '', 'SELLER');

INSERT IGNORE INTO sellers (id, name, email, status) VALUES 
('SEL-2001', 'Andaman Fish Co', 'co@andaman.com', 'ACTIVE'),
('SEL-2002', 'Deep Sea Catch', 'catch@deepsea.com', 'ACTIVE');

-- Ensure there are products
INSERT IGNORE INTO products (id, seller_id, name, category, price, status) VALUES 
('PRD-3001', 'SEL-2001', 'Premium Tuna', 'Tuna', 500.00, 'ACTIVE'),
('PRD-3002', 'SEL-2002', 'King Prawns', 'Prawns', 850.00, 'ACTIVE');

-- Insert dummy orders
INSERT INTO orders (user_id, total_amount, status, delivery_address, delivery_area, created_at) VALUES 
('USR-1001', 1250.00, 'PENDING', '123 Harbor Way, Port Blair, Andaman', 'Port Blair', NOW() - INTERVAL 2 HOUR),
('USR-1002', 3400.50, 'SHIPPED', 'Beach Road, Havelock Island, Andaman', 'Havelock Island', NOW() - INTERVAL 1 DAY),
('USR-1001', 850.00, 'DELIVERED', 'Market Street, Garacharma', 'Garacharma', NOW() - INTERVAL 3 DAY),
('USR-1002', 4200.00, 'PENDING', 'Resort Area, Neil Island', 'Neil Island', NOW() - INTERVAL 10 MINUTE);

-- Insert order items to satisfy the join in the query
INSERT INTO order_items (order_id, product_id, quantity, price) 
SELECT id, 'PRD-3001', 2, 500.00 FROM orders WHERE user_id = 'USR-1001';

INSERT INTO order_items (order_id, product_id, quantity, price) 
SELECT id, 'PRD-3002', 4, 850.00 FROM orders WHERE user_id = 'USR-1002';

