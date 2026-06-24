import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  const url = "postgres://postgres.kyqmhibffbwoqlpdplfu:Sankar%401986%2304@db.kyqmhibffbwoqlpdplfu.supabase.co:5432/postgres";
  try {
    const sql = postgres(url, { ssl: 'require' });
    
    console.log("Starting Supabase schema migration...");
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_at TIMESTAMP NULL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_temp NUMERIC NULL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS recipes TEXT NULL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition TEXT NULL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS harbor_node VARCHAR(255) NULL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_live_inventory BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_rank VARCHAR(50) NULL`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg'`;
    
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: "Supabase database schema altered successfully!",
      columns: cols.map((c: any) => c.column_name)
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
