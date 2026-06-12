const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1/users';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function getUsers() {
    const res = await fetch(`${supabaseUrl}?select=email,role,status`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    const users = await res.json();
    console.log(users.filter(u => u.role === 'ADMIN' || u.role === 'AGENT'));
}

getUsers();
