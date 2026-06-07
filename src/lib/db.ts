import postgres from 'postgres';
import { BRIDGE_URL } from '@/config/api';

// Establish connection to Supabase PostgreSQL when running online
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || "postgres://postgres:Sankar%401986%2304@db.kyqmhibffbwoqlpdplfu.supabase.co:5432/postgres";

let sql: any = null;
if (connectionString) {
  try {
    sql = postgres(connectionString, {
      ssl: 'require',
      connect_timeout: 10,
      max: 10, // connection pool size
    });
    console.log("🌊 Direct Supabase PostgreSQL Client Initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Supabase PostgreSQL Client:", err);
  }
}

export async function query(sqlQuery: string, params: any[] = [], type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT') {
  if (sql) {
    try {
      // 1. PostgreSQL does not use backticks for identifiers; replace them with double quotes
      let pgSql = sqlQuery.replace(/`/g, '"');

      // 2. PostgreSQL uses positional placeholders ($1, $2, etc.) instead of MySQL "?" placeholders
      let index = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${index++}`);

      // 3. For auto-incrementing tables, we need to append RETURNING id to get the insert ID back
      if (type === 'INSERT' && !pgSql.toUpperCase().includes('RETURNING')) {
        const lowerSql = pgSql.toLowerCase();
        if (lowerSql.includes('user_addresses') || lowerSql.includes('user_payments')) {
          pgSql += ' RETURNING id';
        }
      }

      // Execute dynamic query on Supabase PostgreSQL
      const result = await sql.unsafe(pgSql, params);

      if (type === 'SELECT') {
        return { success: true, data: result };
      } else if (type === 'INSERT') {
        const lastInsertId = result && result[0] ? result[0].id : null;
        return { success: true, id: lastInsertId };
      } else {
        return { success: true, affected: result.count || 0 };
      }
    } catch (error: any) {
      console.error("❌ Supabase DB Query Error:", error);
      throw new Error(`Database Error: ${error.message}`);
    }
  }

  throw new Error("No database connection string provided");
}

// Helper for single row fetch
export async function queryOne(sqlQuery: string, params: any[] = []) {
  const result = await query(sqlQuery, params, 'SELECT');
  return result.data && result.data.length > 0 ? result.data[0] : null;
}

