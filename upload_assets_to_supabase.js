const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const baseDir = path.join(process.cwd(), 'public', 'uploads');

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        case '.svg': return 'image/svg+xml';
        case '.json': return 'application/json';
        default: return 'application/octet-stream';
    }
}

async function uploadDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            await uploadDirectory(fullPath);
        } else {
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            
            console.log(`Uploading ${relativePath}...`);
            const fileBuffer = fs.readFileSync(fullPath);
            const contentType = getMimeType(fullPath);
            
            const endpoint = `${supabaseUrl}/storage/v1/object/assets/${encodeURI(relativePath)}`;
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': contentType,
                    'x-upsert': 'true'
                },
                body: fileBuffer
            });
                
            if (!res.ok) {
                const errText = await res.text();
                console.error(`Failed to upload ${relativePath}:`, errText);
            } else {
                console.log(`Successfully uploaded ${relativePath}`);
            }
        }
    }
}

async function main() {
    console.log('Starting migration to Supabase Storage bucket: assets');
    await uploadDirectory(baseDir);
    console.log('Finished uploading all assets.');
}

main();
