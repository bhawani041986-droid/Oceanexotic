const fs = require('fs');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1/users';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function importUsers() {
    console.log("Reading users.csv...");
    const content = fs.readFileSync('users.csv', 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    
    const dataLines = lines.slice(1);
    
    for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        
        let inQuote = false;
        let fields = [];
        let curr = '';
        for (let char of line) {
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                fields.push(curr);
                curr = '';
            } else {
                curr += char;
            }
        }
        fields.push(curr);

        const id = fields[0];
        const name = fields[1];
        const email = fields[2];
        const password = fields[3];
        const role = fields[4];
        const territory_id = fields[5] || null;
        const status = fields[6];
        const created_at = fields[7];
        const avatar_url = fields[8] || null;

        console.log(`Importing: ${email} ...`);

        const payload = {
            id, name, email, password, role, territory_id, status, created_at, avatar_url
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
            console.error(`Error importing ${email}:`, err);
        } else {
            console.log(`Success importing ${email}`);
        }
    }
}

importUsers();
