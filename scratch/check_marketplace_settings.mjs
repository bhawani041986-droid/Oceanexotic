global.WebSocket = class {};
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
  const { data, error } = await supabase.from('marketplace_settings').select('*');
  if (error) {
    console.error('Error fetching settings:', error);
  } else {
    console.log("MARKETPLACE SETTINGS IN SUPABASE:");
    data.forEach(row => {
      if (row.setting_key.startsWith('flashDeal')) {
        console.log(`  ${row.setting_key}:`, row.setting_value);
      }
    });
  }
}
checkSettings();
