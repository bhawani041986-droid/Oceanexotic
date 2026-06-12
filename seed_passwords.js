const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1/users';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const sellers = [
    'bhawani@oceanfresh.com',
    'devansh@oceanfresh.com',
    'deep@oceanfresh.com',
    'rig@oceanfresh.com'
];

async function updatePasswords() {
    const hash = bcrypt.hashSync('ocean123', 10);
    console.log("Correct hash generated:", hash);
    
    for (const email of sellers) {
        console.log(`Updating ${email}...`);
        const res = await fetch(`${supabaseUrl}?email=eq.${encodeURIComponent(email)}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: hash
            })
        });

        if (!res.ok) {
            console.error(`Error updating ${email}:`, await res.text());
        } else {
            console.log(`Successfully updated ${email}`);
        }
    }
    console.log("Done.");
}

updatePasswords();
