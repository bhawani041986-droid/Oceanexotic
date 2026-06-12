const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const defaultCuts = [
    { cut_type: 'WHOLE', price_modifier_percent: 0, price_flat_add: 0, is_available: 1, sort_order: 1 },
    { cut_type: 'CLEANED', price_modifier_percent: 10, price_flat_add: 20, is_available: 1, sort_order: 2 },
    { cut_type: 'CURRY_CUT', price_modifier_percent: 15, price_flat_add: 30, is_available: 1, sort_order: 3 },
    { cut_type: 'STEAK', price_modifier_percent: 20, price_flat_add: 50, is_available: 1, sort_order: 4 },
    { cut_type: 'FILLET', price_modifier_percent: 25, price_flat_add: 80, is_available: 1, sort_order: 5 },
];

async function seedCuts() {
    const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    };

    // Fetch all products
    const pRes = await fetch(`${supabaseUrl}/products?select=id,name`, { headers });
    const products = await pRes.json();

    // Fetch all cut options
    const cRes = await fetch(`${supabaseUrl}/product_cut_options?select=product_id,cut_type`, { headers });
    const cuts = await cRes.json();

    const cutsByProduct = {};
    cuts.forEach(c => {
        if (!cutsByProduct[c.product_id]) cutsByProduct[c.product_id] = [];
        cutsByProduct[c.product_id].push(c.cut_type);
    });

    const newCuts = [];

    products.forEach(p => {
        if (!cutsByProduct[p.id] || cutsByProduct[p.id].length === 0) {
            defaultCuts.forEach(cut => {
                newCuts.push({
                    id: `CUT-${p.id}-${cut.cut_type}-${Date.now()}`,
                    product_id: p.id,
                    ...cut
                });
            });
        }
    });

    console.log(`Inserting ${newCuts.length} cutting options for ${newCuts.length / 5} products...`);
    
    // Insert in batches of 100
    for (let i = 0; i < newCuts.length; i += 100) {
        const batch = newCuts.slice(i, i + 100);
        const res = await fetch(`${supabaseUrl}/product_cut_options`, {
            method: 'POST',
            headers,
            body: JSON.stringify(batch)
        });
        if (!res.ok) console.error("Batch error:", await res.text());
        else console.log(`Inserted batch ${i} to ${i + 100}`);
    }
    
    console.log("Done.");
}

seedCuts();
