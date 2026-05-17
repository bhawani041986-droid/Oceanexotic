<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDB();

    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($product) {
                // Fetch cut options
                $cutStmt = $pdo->prepare("SELECT * FROM product_cut_options WHERE product_id = ? ORDER BY sort_order ASC");
                $cutStmt->execute([$id]);
                $product['cut_options'] = $cutStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($product);
        } else {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
        }
    } 
    else if ($method === 'POST' || $method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) throw new Exception("Invalid data received.");

        $id = $data['id'] ?? null;
        if ($method === 'PUT' && !$id) throw new Exception("Asset ID required for modification.");
        if (!$id) $id = 'PRD-' . time() . '-' . rand(1000, 9999);

        $seller_id = $data['seller_id'] ?? $data['sellerId'] ?? 'SEL-001';
        $is_live = isset($data['is_live_inventory']) ? (int)$data['is_live_inventory'] : 0;

        if ($method === 'POST') {
            $sql = "INSERT INTO products (id, seller_id, name, category, price, stock, status, image_url, gallery, description, unit, is_live_inventory, harbor_node, catch_date, nutrition, quality_rank) 
                    VALUES (:id, :seller_id, :name, :category, :price, :stock, :status, :image_url, :gallery, :description, :unit, :is_live, :harbor, :catch_date, :nutrition, :quality_rank)";
        } else {
            $sql = "UPDATE products SET 
                        seller_id = :seller_id,
                        name = :name, 
                        category = :category, 
                        price = :price, 
                        stock = :stock, 
                        status = :status, 
                        image_url = :image_url, 
                        gallery = :gallery,
                        description = :description,
                        unit = :unit,
                        is_live_inventory = :is_live,
                        harbor_node = :harbor,
                        catch_date = :catch_date,
                        nutrition = :nutrition,
                        quality_rank = :quality_rank
                    WHERE id = :id";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'seller_id' => $seller_id,
            'name' => $data['name'],
            'category' => $data['category'],
            'price' => $data['price'],
            'stock' => $data['stock'] ?? 0,
            'status' => $data['status'] ?? 'ACTIVE',
            'image_url' => $data['image_url'] ?? '',
            'gallery' => isset($data['gallery']) ? (is_string($data['gallery']) ? $data['gallery'] : json_encode($data['gallery'])) : '[]',
            'description' => $data['description'] ?? '',
            'unit' => $data['unit'] ?? 'kg',
            'is_live' => $is_live,
            'harbor' => $data['harbor_node'] ?? 'NA',
            'catch_date' => $data['catch_date'] ?? date('Y-m-d'),
            'nutrition' => isset($data['nutrition']) ? (is_string($data['nutrition']) ? $data['nutrition'] : json_encode($data['nutrition'])) : null,
            'quality_rank' => $data['quality_rank'] ?? 'VERIFIED'
        ]);

        // --- Synchronize with todays_catch table ---
        if ($is_live) {
            // Delete old entry for today if exists (to avoid duplicates)
            $pdo->prepare("DELETE FROM todays_catch WHERE product_id = ? AND catch_date = CURDATE()")->execute([$id]);
            
            $catch_id = 'CTH-' . uniqid();
            $batch = $data['batch_label'] ?? 'MORNING';
            $catch_time = $data['catch_time'] ?? date('H:i:s');
            $freshness_ts = date('Y-m-d') . ' ' . $catch_time;
            $expires_at = date('Y-m-d H:i:s', strtotime($freshness_ts . ' +18 hours'));

            $catchStmt = $pdo->prepare("INSERT INTO todays_catch (id, product_id, seller_id, catch_date, harbor_node, quantity_kg, remaining_kg, price_per_kg, freshness_timestamp, expires_at, batch_label, status, catch_image_url) 
                                       VALUES (:id, :p_id, :s_id, CURDATE(), :harbor, :qty, :rem, :price, :fts, :exp, :batch, 'FRESH', :img)");
            $catchStmt->execute([
                'id' => $catch_id,
                'p_id' => $id,
                's_id' => $seller_id,
                'harbor' => $data['harbor_node'] ?? 'Phoenix Bay',
                'qty' => $data['stock'] ?? 100,
                'rem' => $data['stock'] ?? 100,
                'price' => $data['price'],
                'fts' => $freshness_ts,
                'exp' => $expires_at,
                'batch' => $batch,
                'img' => $data['image_url'] ?? ''
            ]);
        }

        // --- Synchronize Cut Options ---
        if (isset($data['cut_options'])) {
            $cutOptions = is_string($data['cut_options']) ? json_decode($data['cut_options'], true) : $data['cut_options'];
            if (is_array($cutOptions)) {
                $pdo->prepare("DELETE FROM product_cut_options WHERE product_id = ?")->execute([$id]);
                $cutStmt = $pdo->prepare("INSERT INTO product_cut_options (id, product_id, cut_type, price_modifier_percent, price_flat_add, is_available, sort_order) 
                                           VALUES (:id, :p_id, :type, :mod, :flat, :avail, :sort)");
                foreach ($cutOptions as $idx => $cut) {
                    $cutStmt->execute([
                        'id' => 'CUT-' . uniqid(),
                        'p_id' => $id,
                        'type' => $cut['cut_type'],
                        'mod' => $cut['price_modifier_percent'] ?? 0,
                        'flat' => $cut['price_flat_add'] ?? 0,
                        'avail' => (int)($cut['is_available'] ?? 1),
                        'sort' => $idx
                    ]);
                }
            }
        }

        echo json_encode(["status" => "success", "message" => "Sovereign Registry Synchronized.", "id" => $id]);
    }
    else if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) throw new Exception("ID required.");
        
        $pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM todays_catch WHERE product_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM product_cut_options WHERE product_id = ?")->execute([$id]);
        
        echo json_encode(["status" => "success", "message" => "Asset decommissioned from all nodes."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
