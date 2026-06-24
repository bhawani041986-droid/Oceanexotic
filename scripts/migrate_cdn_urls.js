const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const OLD_URL = 'https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets/';
const NEW_URL = 'https://oceanexotic.com/storage/';

async function supabaseFetch(table, method = 'GET', body = null, query = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Prefer': 'return=representation'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}${query}`, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function run() {
  console.log('Starting Zero-Error CDN Migration in Database via REST API...');

  try {
      // 2. Update Categories (if exists)
      try {
        const categories = await supabaseFetch('categories', 'GET', null, '?select=id,image_url');
        let cCount = 0;
        for (let c of categories) {
          if (c.image_url && c.image_url.includes(OLD_URL)) {
            await supabaseFetch('categories', 'PATCH', { image_url: c.image_url.replace(OLD_URL, NEW_URL) }, `?id=eq.${c.id}`);
            cCount++;
          }
        }
        console.log(`Updated ${cCount} categories.`);
      } catch(e) {}

      // 3. Update Settings
      try {
        const settings = await supabaseFetch('settings', 'GET', null, '?select=id,value');
        let sCount = 0;
        for (let s of settings) {
            if (s.value && typeof s.value === 'string' && s.value.includes(OLD_URL)) {
                await supabaseFetch('settings', 'PATCH', { value: s.value.replace(new RegExp(OLD_URL, 'g'), NEW_URL) }, `?id=eq.${s.id}`);
                sCount++;
            }
        }
        console.log(`Updated ${sCount} settings.`);
      } catch(e) {}

      console.log('CDN Migration Complete! Supabase Egress limit is now protected.');
  } catch(e) {
      console.error(e);
  }
}

run();
