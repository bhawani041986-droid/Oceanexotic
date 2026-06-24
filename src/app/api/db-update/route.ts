import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const results: Record<string, string> = {};

  // Helper to run DDL via exec_sql RPC (must exist as a DB function)
  const runDDL = async (sql: string, label: string) => {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      // If exec_sql doesn't exist, try pg_execute or similar
      results[label] = `rpc_error: ${error.message}`;
    } else {
      results[label] = 'ok';
    }
  };

  try {
    // Step 1: Try to add columns via RPC exec_sql
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_at TIMESTAMPTZ NULL", 'landed_at');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_temp NUMERIC NULL", 'storage_temp');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS recipes TEXT NULL", 'recipes');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition TEXT NULL", 'nutrition');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS harbor_node VARCHAR(255) NULL", 'harbor_node');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_live_inventory BOOLEAN DEFAULT FALSE", 'is_live_inventory');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_rank VARCHAR(50) NULL", 'quality_rank');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0", 'discount_percent');
    await runDDL("ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'kg'", 'unit');

    // Step 2: Seed landed_at for products that have null
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { error: seedError, count } = await supabase
      .from('products')
      .update({ landed_at: twoHoursAgo })
      .is('landed_at', null);
    results['seed_landed_at'] = seedError ? `error: ${seedError.message}` : `seeded ${count ?? 'all'} rows`;

    // Step 3: Verify
    const { data: sample } = await supabase
      .from('products')
      .select('id, name, landed_at')
      .limit(3);

    return NextResponse.json({
      success: true,
      message: 'Schema migration complete',
      ddl_results: results,
      sample_products: sample || []
    });

  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      partial_results: results
    }, { status: 500 });
  }
}

