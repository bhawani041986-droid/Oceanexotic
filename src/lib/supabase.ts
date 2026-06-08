import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iklzcaqqvbrfxevufebi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbHpjYXFxdmJyZnhldnVmZWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzY1MzQsImV4cCI6MjA5NjExMjUzNH0.VagvlMH0R3a6Z2x_quTxS3tgN5zWMiE5ypGzVPsT5lU';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
