global.WebSocket = class {};

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.oD2i0R2eJq6aD2i0R2eJq6aD2i0R2eJq6aD2i0R2eJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('product_videos').select('*').limit(10);
  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Success! Data:', data);
  }
}
test();
