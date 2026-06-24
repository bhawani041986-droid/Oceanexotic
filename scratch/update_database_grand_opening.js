const supabaseUrl = "https://kyqmhibffbwoqlpdplfu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs";

async function updateDb() {
  try {
    // 1. Update cms_content row where id = 3
    const resCms = await fetch(`${supabaseUrl}/rest/v1/cms_content?id=eq.3`, {
      method: "PATCH",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        title: "GRAND OPENING"
      })
    });
    
    if (!resCms.ok) {
      console.error("CMS PATCH HTTP Error:", resCms.status, await resCms.text());
    } else {
      console.log("CMS content updated:", await resCms.json());
    }

    // 2. Upsert settings into marketplace_settings (using on_conflict=setting_key)
    const settingsToUpsert = [
      { setting_key: "flashDealTitle", setting_value: "GRAND OPENING" }
    ];

    const resSettings = await fetch(`${supabaseUrl}/rest/v1/marketplace_settings?on_conflict=setting_key`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(settingsToUpsert)
    });

    if (!resSettings.ok) {
      console.error("Settings POST HTTP Error:", resSettings.status, await resSettings.text());
    } else {
      console.log("Marketplace settings successfully updated (upserted to GRAND OPENING).");
    }
  } catch (err) {
    console.error("Network Error:", err);
  }
}

updateDb();
