const fs = require('fs');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1/products';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function importProducts() {
    console.log("Loading products...");
    const content = fs.readFileSync('src/constants/products.ts', 'utf8');
    
    // Quick regex to extract the array of products from the typescript file
    const match = content.match(/export const MASTER_PRODUCT_REGISTRY: Product\[\] = (\[[\s\S]*?\]);/);
    if (!match) {
        console.error("Could not parse products.ts");
        return;
    }
    
    let productsStr = match[1];
    
    // Evaluate the JS array string (safe enough for this internal file)
    let productsArray = [];
    try {
        productsArray = eval(productsStr);
    } catch(e) {
        console.error("Eval error", e);
        return;
    }

    for (let p of productsArray) {
        console.log(`Importing product: ${p.name}`);
        
        // Match the database schema
        const payload = {
            id: p.id,
            seller_id: 'SEL-2001', // Fallback seller from users table
            name: p.name,
            category: p.category || 'Premium',
            price: p.price,
            stock: typeof p.stock === 'number' ? p.stock : 100,
            status: p.status === 'ACTIVE' ? 'ACTIVE' : 'OUT_OF_STOCK',
            image_url: p.image || '',
            gallery: JSON.stringify(p.images || []),
            description: p.description || ''
        };

        const res = await fetch(supabaseUrl, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Error importing ${p.name}:`, err);
        } else {
            console.log(`Success importing ${p.name}`);
        }
    }
}

importProducts();
