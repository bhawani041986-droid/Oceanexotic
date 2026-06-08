const mysql = require('mysql2/promise');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co/rest/v1';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const tablesToMigrate = [
    'sellers', // first because of products
    'maritime_territories',
    'delivery_agents',
    'cms_content',
    'marketplace_settings',
    'subscribers',
    'social_settings',
    'addons',
    'agent_settings',
    'chat_conversations',
    'chat_messages',
    'todays_catch',
    'user_addresses',
    'user_payments',
    'seller_verification_docs',
    'seller_withdrawals',
    'product_cut_options',
    'product_location_overrides',
    'product_prep_options',
    'orders',
    'order_items',
    'reviews',
    'fleet_tracking',
    'fleet_logs',
    'inventory_logs',
    'verified_orders'
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanRow(row) {
    let clean = {};
    for (const [key, value] of Object.entries(row)) {
        if (value instanceof Date) {
            // MySQL zero dates become Invalid Date in JS or strings. Handle them:
            if (isNaN(value)) {
                clean[key] = null;
            } else {
                clean[key] = value.toISOString();
            }
        } else if (value === '0000-00-00 00:00:00' || value === '0000-00-00') {
            clean[key] = null;
        } else if (Buffer.isBuffer(value)) {
            // Probably a boolean tinyint
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

    console.log("Connected to local MySQL successfully.");

    for (let table of tablesToMigrate) {
        console.log(`\n--- Migrating table: ${table} ---`);
        
        try {
            const [rows] = await connection.query(`SELECT * FROM ${table}`);
            console.log(`Found ${rows.length} rows in ${table}.`);

            if (rows.length === 0) continue;

            const chunkSize = 200;
            for (let i = 0; i < rows.length; i += chunkSize) {
                const chunk = rows.slice(i, i + chunkSize).map(cleanRow);
                
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
                    const errorText = await res.text();
                    console.error(`Error inserting chunk ${i/chunkSize} for ${table}:`, errorText);
                } else {
                    console.log(`Successfully inserted ${chunk.length} rows into ${table}.`);
                }
                
                // rate limit ourselves slightly
                await delay(100);
            }
        } catch(e) {
            console.error(`Error fetching data for ${table}:`, e.message);
        }
    }

    await connection.end();
    console.log("\nMigration completed successfully.");
}

migrateData();
