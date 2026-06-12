const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function checkAdmin() {
    const res = await fetch(`${supabaseUrl}/users?email=eq.admin@oceanexotic.com`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    console.log(await res.json());
}
checkAdmin();
