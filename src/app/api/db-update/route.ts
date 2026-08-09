import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  // Setup connection to Supabase DB via direct database IPv6 address (works on Vercel edge/lambda)
  const sql = postgres({
    host: '2406:da12:557:f802:5399:88de:5f6c:d2be',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'Sankar@1986#26',
    ssl: 'require',
    connect_timeout: 20
  });

  try {
    results['connection'] = 'Connecting to database...';
    
    // Test connection
    const timeRes = await sql`SELECT NOW()`;
    results['db_time'] = timeRes[0];

    // Alter table products to add missing columns
    results['migrations'] = [];

    const queries = [
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_at TIMESTAMP WITH TIME ZONE NULL`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_temp NUMERIC NULL`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS recipes TEXT NULL`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition TEXT NULL`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS harbor_node VARCHAR(255) NULL`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_live_inventory BOOLEAN DEFAULT FALSE`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_rank VARCHAR(50) NULL`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg'`,
      sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`,
      sql`ALTER TABLE maritime_territories ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0`,
      sql`ALTER TABLE maritime_territories ADD COLUMN IF NOT EXISTS minimum_order NUMERIC DEFAULT 0`,
      sql`ALTER TABLE maritime_territories ADD COLUMN IF NOT EXISTS eta_mins INTEGER DEFAULT 30`,
      sql`ALTER TABLE maritime_territories ADD COLUMN IF NOT EXISTS hub_code VARCHAR(100) NULL`,
      sql`ALTER TABLE maritime_territories ADD COLUMN IF NOT EXISTS manager_name VARCHAR(100) NULL`,
      sql`ALTER TABLE maritime_territories ADD COLUMN IF NOT EXISTS rider_capacity INTEGER DEFAULT 0`
    ];

    for (let i = 0; i < queries.length; i++) {
      try {
        await queries[i];
        results['migrations'].push(`Query ${i + 1} succeeded`);
      } catch (err: any) {
        results['migrations'].push(`Query ${i + 1} failed: ${err.message}`);
      }
    }

    // Seed default landed_at for products where it is null (set to 2 hours ago)
    try {
      await sql`UPDATE products SET landed_at = NOW() - INTERVAL '2 hours' WHERE landed_at IS NULL`;
      results['seed_landed_at'] = 'Succeeded';
    } catch (err: any) {
      results['seed_landed_at'] = `Failed: ${err.message}`;
    }

    // Let's get current columns
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `;
    results['current_columns'] = cols.map((c: any) => c.column_name);

    await sql.end();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    try {
      await sql.end();
    } catch (_) {}
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 });
  }
}
