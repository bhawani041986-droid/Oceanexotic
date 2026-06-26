import postgres from 'postgres';

async function test() {
  const poolerIps = ['15.164.120.176', '15.165.245.138', '13.124.111.232'];
  const password = 'Sankar@1986#04';
  const projectRef = 'kyqmhibffbwoqlpdplfu';
  const username = `postgres.${projectRef}`;
  
  for (const port of [5432, 6543]) {
    for (const ip of poolerIps) {
      console.log(`Connecting to pooler IP ${ip} on port ${port} with SNI db.${projectRef}.supabase.co...`);
      try {
        const sql = postgres({
          host: ip,
          port: port,
          database: 'postgres',
          username: username,
          password: password,
          ssl: {
            rejectUnauthorized: false,
            servername: `db.${projectRef}.supabase.co`
          },
          connect_timeout: 8
        });

        const res = await sql`SELECT NOW()`;
        console.log("🎉 SUCCESS! Server time:", res[0]);
        
        console.log("Adding is_featured column...");
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
        console.log("🎉 SUCCESS! is_featured column verified/added!");
        
        await sql.end();
        process.exit(0);
      } catch (err) {
        console.error("Failed:", err.message);
      }
    }
  }
}
test();
