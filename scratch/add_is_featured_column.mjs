import postgres from 'postgres';

async function run() {
  const sql = postgres({
    host: '2406:da12:557:f802:5399:88de:5f6c:d2be',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'Sankar@1986#04',
    ssl: 'require',
    connect_timeout: 10
  });

  try {
    console.log("Adding is_featured column to products table in Supabase...");
    
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
    
    console.log("SUCCESS! is_featured column added/verified in Supabase.");
    
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `;
    console.log("CURRENT COLUMNS:", cols.map(c => c.column_name));
    
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err);
    process.exit(1);
  }
}
run();
