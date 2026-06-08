const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iklzcaqqvbrfxevufebi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbHpjYXFxdmJyZnhldnVmZWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzY1MzQsImV4cCI6MjA5NjExMjUzNH0.VagvlMH0R3a6Z2x_quTxS3tgN5zWMiE5ypGzVPsT5lU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Success! Data:', data);
  }
}
test();
