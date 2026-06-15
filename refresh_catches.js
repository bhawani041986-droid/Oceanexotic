global.WebSocket = class {};

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Updating todays_catch records to be FRESH today...");
  
  const today = new Date().toISOString().split('T')[0]; // '2026-06-15'
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const freshness = new Date().toISOString();

  const { data, error } = await supabase
    .from('todays_catch')
    .update({
      status: 'FRESH',
      catch_date: today,
      freshness_timestamp: freshness,
      expires_at: tomorrow,
      remaining_kg: 100 // ensure remaining_kg is greater than 0
    })
    .or('id.eq.CATCH-DEMO-001,id.eq.CATCH-DEMO-002,id.eq.CATCH-DEMO-003');

  if (error) {
    console.error("Error refreshing catches:", error);
  } else {
    console.log("Successfully refreshed catches status, date, and expiry!");
    
    // Let's verify by querying again
    const { data: updatedCatches } = await supabase
      .from('todays_catch')
      .select('*')
      .eq('status', 'FRESH');
    console.log("Active FRESH catches in DB:", updatedCatches);
  }
}

run();
