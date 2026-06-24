const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

async function supabaseFetch(endpoint, method = 'GET', body = null) {
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
  const res = await fetch(`${supabaseUrl}${endpoint}`, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function listFolder(folderPath = '') {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ prefix: folderPath, limit: 10000, offset: 0 })
    });
    if (!res.ok) return [];
    return res.json();
}

async function run() {
  console.log('Starting Zero-Risk Garbage Analysis...');

  const activeFiles = new Set();
  
  function extractFilenamesFromText(text) {
      if (!text) return;
      if (typeof text !== 'string') text = JSON.stringify(text);
      
      // Look for oceanexotic.com/storage/ or supabase.co/storage/...
      const match = text.match(/https?:\/\/[^\s",]+/g);
      if (match) {
          match.forEach(url => {
              const basename = url.substring(url.lastIndexOf('/') + 1);
              if (basename) activeFiles.add(basename);
          });
      }
      
      // Also try to just match typical filenames if stored as raw strings
      const rawMatch = text.match(/([a-zA-Z0-9_.-]+(?:jpg|jpeg|png|webp|mp4))/gi);
      if (rawMatch) {
          rawMatch.forEach(file => activeFiles.add(file));
      }
  }

  // 1. PRODUCTS
  try {
      const products = await supabaseFetch('/rest/v1/products?select=image_url,gallery,video_url');
      for (let p of products) {
          extractFilenamesFromText(p.image_url);
          extractFilenamesFromText(p.gallery);
          extractFilenamesFromText(p.video_url);
      }
  } catch(e) { console.error('Error reading products:', e.message); }

  // 2. CMS CONTENT
  try {
      const cms = await supabaseFetch('/rest/v1/cms_content?select=image_url,metadata');
      for (let c of cms) {
          extractFilenamesFromText(c.image_url);
          extractFilenamesFromText(c.metadata);
      }
  } catch(e) { console.error('Error reading cms:', e.message); }

  // 3. USERS
  try {
      const users = await supabaseFetch('/rest/v1/users?select=avatar_url');
      for (let u of users) {
          extractFilenamesFromText(u.avatar_url);
      }
  } catch(e) { console.error('Error reading users:', e.message); }

  // 4. MARKETPLACE SETTINGS
  try {
      const settings = await supabaseFetch('/rest/v1/marketplace_settings?select=setting_value');
      for (let s of settings) {
          extractFilenamesFromText(s.setting_value);
      }
  } catch(e) { console.error('Error reading settings:', e.message); }

  console.log(`Extracted ${activeFiles.size} unique active filename patterns from Database.`);

  // CRAWL BUCKET
  const allFiles = [];
  async function crawl(prefix) {
      const files = await listFolder(prefix);
      for (const f of files) {
          if (f.name === '.emptyFolderPlaceholder') continue;
          if (!f.id) {
              await crawl(prefix + f.name + '/');
          } else {
              allFiles.push({
                  path: prefix + f.name,
                  name: f.name,
                  size_mb: (f.metadata?.size || 0) / (1024 * 1024)
              });
          }
      }
  }
  await crawl('');
  
  console.log(`Found ${allFiles.length} total files in Supabase Storage.`);

  const unusedFiles = [];
  const overweightFiles = [];
  const OVERWEIGHT_THRESHOLD_MB = 1.0;

  for (const f of allFiles) {
      const isUsed = activeFiles.has(f.name);
      
      if (!isUsed) {
          unusedFiles.push(f);
      }

      if (f.size_mb >= OVERWEIGHT_THRESHOLD_MB) {
          overweightFiles.push({ ...f, used: isUsed });
      }
  }

  // Write report
  const reportPath = path.join(__dirname, 'garbage_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
      total_storage_files: allFiles.length,
      total_unused_files: unusedFiles.length,
      unused_files_to_delete: unusedFiles.map(f => f.path),
      total_overweight_files: overweightFiles.length,
      overweight_files: overweightFiles.map(f => `${f.path} (${f.size_mb.toFixed(2)} MB) - Used: ${f.used}`)
  }, null, 2));

  console.log(`Identified ${unusedFiles.length} unused files.`);
  console.log(`Identified ${overweightFiles.length} overweight files (>= 1MB).`);
  console.log(`Report saved to: ${reportPath}`);
}

run();
