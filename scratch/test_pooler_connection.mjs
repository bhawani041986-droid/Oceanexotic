import postgres from 'postgres';

const projectIds = ['kyqmhibffbwoqlpdplfu', 'iklzcaqqvbrfxevufebi'];
const password = 'Sankar@1986#04';
const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
const port = 6543;

async function testConnection() {
  for (const projectId of projectIds) {
    const username = `postgres.${projectId}`;
    console.log(`Connecting to ${host}:${port} as user ${username}...`);
    try {
      const sql = postgres({
        host,
        port,
        database: 'postgres',
        username,
        password,
        ssl: 'require',
        connect_timeout: 10
      });

      const res = await sql`SELECT NOW()`;
      console.log(`🎉 SUCCESS! Connected as ${username}. Server time:`, res[0]);
      
      console.log("Altering products table to add missing columns...");
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
      console.log("🎉 SUCCESS! Added/verified column is_featured!");
      
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products'
      `;
      console.log("Columns:", cols.map(c => c.column_name));
      
      await sql.end();
      return;
    } catch (err) {
      console.error(`❌ FAILED for ${username}:`, err.message);
    }
  }
}

testConnection().catch(console.error);
