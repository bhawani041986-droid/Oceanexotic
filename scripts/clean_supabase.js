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
  console.log('Starting Zero-Risk Garbage Collection...');

  // 1. Gather all ACTIVE filenames from Database
  const activeFiles = new Set();
  
  function extractFilename(url) {
      if (!url) return null;
      try {
          // URLs are now mostly https://oceanexotic.com/storage/...
          // We just need the file basename or the relative path
          const parts = url.split('/assets/');
          if (parts.length > 1) {
              return parts[1]; // e.g. "cms/123-image.jpg"
          }
          // Fallback just grab the last segment
          return url.substring(url.lastIndexOf('/') + 1);
      } catch (e) {
          return null;
      }
  }

  try {
      const products = await supabaseFetch('/rest/v1/products?select=image_url,image_urls,video_url');
      for (let p of products) {
          if (p.image_url) activeFiles.add(extractFilename(p.image_url));
          if (p.video_url) activeFiles.add(extractFilename(p.video_url));
          if (p.image_urls && Array.isArray(p.image_urls)) {
              p.image_urls.forEach(u => activeFiles.add(extractFilename(u)));
          }
      }
  } catch(e) {}

  try {
      const categories = await supabaseFetch('/rest/v1/categories?select=image_url');
      for (let c of categories) {
          if (c.image_url) activeFiles.add(extractFilename(c.image_url));
      }
  } catch(e) {}

  try {
      const settings = await supabaseFetch('/rest/v1/settings?select=value');
      for (let s of settings) {
          if (s.value && typeof s.value === 'string' && s.value.includes('http')) {
              // rough extraction for settings since it might be a json string
              const match = s.value.match(/https?:\/\/[^\s"]+/g);
              if (match) {
                  match.forEach(url => activeFiles.add(extractFilename(url)));
              }
          }
      }
  } catch(e) {}

  console.log(`Found ${activeFiles.size} unique active files in Database.`);

  // 2. List all files in Supabase Storage
  const allFiles = [];
  async function crawl(prefix) {
      const files = await listFolder(prefix);
      for (const f of files) {
          if (f.name === '.emptyFolderPlaceholder') continue;
          if (!f.id) {
              await crawl(prefix + f.name + '/');
          } else {
              allFiles.push(prefix + f.name);
          }
      }
  }
  await crawl('');
  
  console.log(`Found ${allFiles.length} total files in Supabase Storage.`);

  // 3. Delete Unused Files
  const filesToDelete = [];
  for (const filePath of allFiles) {
      // Also check if the basename is in active files just in case the path matching is slightly off
      const basename = filePath.substring(filePath.lastIndexOf('/') + 1);
      
      if (!activeFiles.has(filePath) && !activeFiles.has(basename)) {
          filesToDelete.push(filePath);
      }
  }

  console.log(`Identified ${filesToDelete.length} unused files for deletion.`);

  if (filesToDelete.length > 0) {
      const res = await fetch(`${supabaseUrl}/storage/v1/object/assets`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
          },
          body: JSON.stringify({ prefixes: filesToDelete })
      });
      if (res.ok) {
          console.log('Successfully deleted all garbage files from Supabase.');
      } else {
          console.error('Failed to delete files:', await res.text());
      }
  } else {
      console.log('No garbage files to delete.');
  }
}

run();
