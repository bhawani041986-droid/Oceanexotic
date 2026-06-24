const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const BACKUP_DIR = path.join(__dirname, '../public/supabase_backup');

const getMimeType = (ext) => {
    const map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.json': 'application/json',
        '.apk': 'application/vnd.android.package-archive',
        '.css': 'text/css'
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
};

async function uploadFile(relativePath, buffer, mimeType) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/assets/${relativePath}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': mimeType,
            'x-upsert': 'true'
        },
        body: buffer
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
}

async function run() {
  console.log('Starting Emergency Restore via REST API...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
      console.error('CRITICAL: Backup directory not found!');
      return;
  }

  const filesToUpload = [];
  function crawl(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
              crawl(fullPath);
          } else {
              filesToUpload.push(fullPath);
          }
      }
  }
  crawl(BACKUP_DIR);

  console.log(`Found ${filesToUpload.length} files to restore.`);

  let restoredCount = 0;
  for (const filePath of filesToUpload) {
      const relativePath = path.relative(BACKUP_DIR, filePath).replace(/\\/g, '/');
      const buffer = fs.readFileSync(filePath);
      const mimeType = getMimeType(path.extname(filePath));
      
      try {
          await uploadFile(relativePath, buffer, mimeType);
          console.log(`Restored: ${relativePath}`);
          restoredCount++;
      } catch(e) {
          console.error(`Failed to restore ${relativePath}:`, e.message);
      }
  }

  console.log(`Emergency Restore Complete! Successfully restored ${restoredCount} out of ${filesToUpload.length} files.`);
}

run();
