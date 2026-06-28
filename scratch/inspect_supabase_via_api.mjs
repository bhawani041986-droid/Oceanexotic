const SUPABASE_URL = "https://kyqmhibffbwoqlpdplfu.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs";

async function checkCount(tableName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=1`, {
      method: "GET",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Prefer": "count=exact"
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      return `Error: ${res.status} - ${txt}`;
    }
    const range = res.headers.get("content-range");
    if (range) {
      const parts = range.split("/");
      return parts[1] || "0";
    }
    return "0";
  } catch (err) {
    return `Failed: ${err.message}`;
  }
}

async function run() {
  console.log("Checking Supabase active tables...");
  const tables = ["products", "users", "orders", "product_videos", "marketplace_settings", "reviews"];
  
  console.log("\n--- SUPABASE CLIENT API LOAD CHECK ---");
  for (const table of tables) {
    const count = await checkCount(table);
    console.log(`Table '${table}' record count: ${count}`);
  }
  console.log("---------------------------------------\n");
}

run();
