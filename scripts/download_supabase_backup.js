const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const BACKUP_DIR = path.join(__dirname, '../public/supabase_backup');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300) {
          reject(new Error(`Status ${response.statusCode}`));
          return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
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
  console.log('Starting Recursive Supabase Backup...');
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const allFiles = [];
  async function crawl(prefix) {
      const files = await listFolder(prefix);
      for (const f of files) {
          if (f.name === '.emptyFolderPlaceholder') continue;
          if (!f.id) {
              // It's a folder
              await crawl(prefix + f.name + '/');
          } else {
              // It's a file
              allFiles.push(prefix + f.name);
          }
      }
  }

  await crawl('');
  
  console.log(`Found ${allFiles.length} files recursively. Downloading...`);
  
  for (const filePath of allFiles) {
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/assets/${filePath}`;
    const dest = path.join(BACKUP_DIR, filePath);
    
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log(`Skipping ${filePath} (already downloaded)`);
      continue;
    }

    try {
      console.log(`Downloading ${filePath}...`);
      await downloadFile(publicUrl, dest);
    } catch (e) {
      console.error(`Failed to download ${filePath}:`, e.message);
    }
  }
  
  console.log('Recursive Backup complete! Restore point created.');
}

run();
