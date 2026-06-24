import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const supabaseHeaders = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Run SQL via Supabase's internal pg-meta API (available at port 5555)
// Or via the direct /pg/query REST endpoint
async function runSQL(sql: string) {
  // Try Supabase's internal SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: supabaseHeaders,
    body: JSON.stringify({ query: sql })
  });
  return { ok: res.ok, status: res.status, data: await res.text() };
}

// Check if a column exists via REST
async function columnExists(colName: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=${colName}&limit=1`, {
    headers: supabaseHeaders
  });
  return res.ok;
}

export async function GET() {
  const results: Record<string, any> = {};

  // Step 1: Check which columns already exist
  const columns = ['landed_at', 'storage_temp', 'recipes', 'nutrition', 'harbor_node', 'is_live_inventory', 'quality_rank', 'discount_percent', 'unit'];
  const columnStatus: Record<string, boolean> = {};
  
  for (const col of columns) {
    columnStatus[col] = await columnExists(col);
  }
  
  results['column_status'] = columnStatus;
  
  const missingCols = Object.entries(columnStatus).filter(([, exists]) => !exists).map(([col]) => col);
  
  if (missingCols.length === 0) {
    // All columns exist — just seed landed_at if null
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const seedRes = await fetch(`${SUPABASE_URL}/rest/v1/products?landed_at=is.null`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders, 'Prefer': 'return=minimal,count=exact' },
      body: JSON.stringify({ landed_at: twoHoursAgo })
    });
    results['seed'] = { ok: seedRes.ok, status: seedRes.status };
    
    // Verify sample
    const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,landed_at&limit=3`, {
      headers: supabaseHeaders
    });
    results['sample'] = await verifyRes.json();
    
    return NextResponse.json({ success: true, message: 'All columns exist. Seeded landed_at.', ...results });
  }
  
  // Missing columns — return the SQL they need to run in Supabase dashboard
  const ddlSQL = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_at TIMESTAMPTZ NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_temp NUMERIC NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS recipes TEXT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition TEXT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS harbor_node VARCHAR(255) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_live_inventory BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_rank VARCHAR(50) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg';
UPDATE products SET landed_at = NOW() - INTERVAL '2 hours' WHERE landed_at IS NULL;
  `.trim();

  // Try pg/query endpoint (may work from Vercel's network)
  const pgRes = await runSQL(ddlSQL);
  results['pg_query_attempt'] = pgRes;

  return NextResponse.json({
    success: false,
    message: `Missing columns: ${missingCols.join(', ')}. DDL SQL below must be run in Supabase dashboard.`,
    missing_columns: missingCols,
    ddl_sql: ddlSQL,
    pg_query_result: pgRes,
    ...results
  }, { status: 200 });
}

