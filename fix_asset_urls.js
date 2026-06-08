const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';
const storageBaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/';

async function updateTable(table, column) {
    console.log(`Fetching ${table}...`);
    // fetch all, no URL encoding issues
    const res = await fetch(`${supabaseUrl}/${table}?select=id,${column}`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    
    if (!res.ok) {
        console.error(`Failed to fetch ${table}:`, await res.text());
        return;
    }
    
    const allRows = await res.json();
    const rowsToUpdate = allRows.filter(row => {
        let val = row[column];
        if (typeof val === 'string') return val.includes('/uploads/');
        return false;
    });

    console.log(`Found ${rowsToUpdate.length} rows in ${table} with /uploads/ URLs.`);
    
    for (let row of rowsToUpdate) {
        let newValue = row[column];
        if (typeof newValue === 'string') {
            try {
                let parsed = JSON.parse(newValue);
                if (Array.isArray(parsed)) {
                    parsed = parsed.map(url => url.replace(/\/uploads\//g, storageBaseUrl));
                    newValue = JSON.stringify(parsed);
                } else {
                    newValue = newValue.replace(/\/uploads\//g, storageBaseUrl);
                }
            } catch(e) {
                newValue = newValue.replace(/\/uploads\//g, storageBaseUrl);
            }
        }
        
        const updateRes = await fetch(`${supabaseUrl}/${table}?id=eq.${row.id}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ [column]: newValue })
        });
        
        if (!updateRes.ok) {
            console.error(`Failed to update ${table} id ${row.id}:`, await updateRes.text());
        }
    }
    console.log(`Updated ${table} successfully.`);
}

async function main() {
    await updateTable('products', 'image_url');
    await updateTable('products', 'gallery');
    await updateTable('cms_content', 'image_url');
    await updateTable('todays_catch', 'catch_image_url');
    await updateTable('users', 'avatar_url');
    await updateTable('addons', 'image_url');
    console.log('Database URL replacement completed.');
}

main();
