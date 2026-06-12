const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function checkAgents() {
    const res = await fetch(`${supabaseUrl}/users?role=eq.AGENT`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    console.log(await res.json());
}
checkAgents();
