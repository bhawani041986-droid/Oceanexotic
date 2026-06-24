const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function check() {
  try {
    // 1. Search in marketplace_settings
    const url = `${supabaseUrl}/rest/v1/marketplace_settings`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const data = await res.json();
    console.log("Searching marketplace_settings...");
    for (const row of data) {
      if (row.setting_value && row.setting_value.toLowerCase().includes('eel')) {
        console.log(`Match in marketplace_settings [${row.setting_key}]:`, row.setting_value);
      }
    }

    // 2. Search in PRODUCT_CATEGORIES or CATEGORIES
    console.log("Querying PRODUCT_CATEGORIES directly...");
    const catUrl = `${supabaseUrl}/rest/v1/marketplace_settings?setting_key=eq.PRODUCT_CATEGORIES`;
    const catRes = await fetch(catUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const catData = await catRes.json();
    console.log("PRODUCT_CATEGORIES:", JSON.stringify(catData, null, 2));

  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

check();
