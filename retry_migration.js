const mysql = require('mysql2/promise');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const tablesToMigrate = [
    'orders',
    'order_items'
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanRow(row) {
    let clean = {};
    for (const [key, value] of Object.entries(row)) {
        if (value instanceof Date) {
            if (isNaN(value)) {
                clean[key] = null;
            } else {
                clean[key] = value.toISOString();
            }
        } else if (value === '0000-00-00 00:00:00' || value === '0000-00-00') {
            clean[key] = null;
        } else if (Buffer.isBuffer(value)) {
            clean[key] = value.readInt8() === 1;
        } else {
            clean[key] = value;
        }
    }
    return clean;
}

async function migrateData() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3307,
        user: 'root',
        password: '',
        database: 'ocean_fresh'
    });

    for (let table of tablesToMigrate) {
        console.log(`\n--- Migrating table: ${table} ---`);
        try {
            const [rows] = await connection.query(`SELECT * FROM ${table}`);
            if (rows.length === 0) continue;
            const chunk = rows.map(cleanRow);
            const res = await fetch(`${supabaseUrl}/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(chunk)
            });
            if (!res.ok) {
                console.error(`Error inserting ${table}:`, await res.text());
            } else {
                console.log(`Successfully inserted ${chunk.length} rows into ${table}.`);
            }
        } catch(e) {
            console.error(`Error fetching data for ${table}:`, e.message);
        }
    }
    await connection.end();
}
migrateData();
