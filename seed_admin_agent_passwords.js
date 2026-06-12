const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1/users';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function seedAdmin() {
    const hash = bcrypt.hashSync('ocean123', 10);
    const adminEmail = 'admin@oceanexotic.com';
    const uuid = crypto.randomUUID();

    console.log(`Seeding Admin ${adminEmail} with ID ${uuid}...`);
    const resAdmin = await fetch(supabaseUrl, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            id: uuid,
            name: 'OceanExotic Admin',
            email: adminEmail,
            password: hash,
            role: 'ADMIN',
            status: 'ACTIVE'
        })
    });
    
    if (!resAdmin.ok) console.error(`Error seeding admin:`, await resAdmin.text());
    else console.log(`Successfully seeded admin@oceanexotic.com`);
}

seedAdmin();
