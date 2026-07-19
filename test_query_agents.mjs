import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: {
    transport: ws
  }
});

async function test() {
  try {
    console.log('Searching users table for Avay or Ravi...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .or('name.ilike.%avay%,email.ilike.%avay%,name.ilike.%ravi%,email.ilike.%ravi%');

    if (userError) throw userError;
    console.log('Found users:', users);
  } catch (err) {
    console.error(err);
  }
}

test();
