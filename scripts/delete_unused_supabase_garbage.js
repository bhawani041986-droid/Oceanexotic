const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const reportPath = path.join(__dirname, 'garbage_report.json');

async function deleteFile(filePath) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/assets/${filePath}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
        }
    });
    if (!res.ok) {
        throw new Error(await res.text());
    }
}

async function run() {
    console.log('Starting ZERO-ERROR Deletion of Unused Files...');
    if (!fs.existsSync(reportPath)) {
        console.error('Error: garbage_report.json not found!');
        return;
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const filesToDelete = report.unused_files_to_delete || [];

    if (filesToDelete.length === 0) {
        console.log('No files to delete.');
        return;
    }

    console.log(`Proceeding to safely delete ${filesToDelete.length} unused files...`);
    
    let deletedCount = 0;
    for (const file of filesToDelete) {
        try {
            await deleteFile(file);
            console.log(`Deleted: ${file}`);
            deletedCount++;
        } catch (e) {
            console.error(`Failed to delete ${file}:`, e.message);
        }
        // sleep 20ms to avoid rate limits
        await new Promise(r => setTimeout(r, 20));
    }

    console.log(`\nGarbage Collection Complete! Successfully permanently deleted ${deletedCount} unused files.`);
}

run();
