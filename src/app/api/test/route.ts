import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || "postgres://postgres:Sankar%401986%2304@db.kyqmhibffbwoqlpdplfu.supabase.co:5432/postgres";
    
    // 1. Test environment vars
    const envStatus = {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasSupaUrl: !!process.env.SUPABASE_DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      usedConnectionString: connectionString.replace(/:[^:@]+@/, ':***@') // mask password
    };

    // 2. Initialize postgres
    const sql = postgres(connectionString, {
      ssl: 'require',
      connect_timeout: 10,
    });

    // 3. Test Query
    const result = await sql`SELECT NOW()`;

    return NextResponse.json({
      success: true,
      message: 'Supabase Connection Successful!',
      env: envStatus,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    }, { status: 500 });
  }
}
