import postgres from 'postgres';

const host = 'aws-0-ap-northeast-2.pooler.supabase.com';
const port = 6543;
const password = 'Sankar@1986#04';

async function test() {
  const configs = [
    { username: 'postgres.kyqmhibffbwoqlpdplfu', db: 'postgres' },
    { username: 'postgres', db: 'postgres' },
    { username: 'postgres.kyqmhibffbwoqlpdplfu', db: 'postgres', host: 'db.kyqmhibffbwoqlpdplfu.supabase.co' }
  ];

  for (const cfg of configs) {
    console.log(`Trying username: ${cfg.username} db: ${cfg.db} host: ${cfg.host || host}...`);
    try {
      const sql = postgres({
        host: cfg.host || host,
        port,
        database: cfg.db,
        username: cfg.username,
        password,
        ssl: 'require',
        connect_timeout: 10
      });

      const res = await sql`SELECT NOW()`;
      console.log("SUCCESS!", res);
      
      console.log("Adding is_featured column...");
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
      console.log("Column is_featured verified/added!");
      
      await sql.end();
      process.exit(0);
    } catch (err) {
      console.error("Failed:", err.message);
    }
  }
}
test();
