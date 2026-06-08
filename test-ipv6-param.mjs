import postgres from 'postgres';

async function test() {
  const url = "postgres://postgres:Sankar%401986%2304@db.kyqmhibffbwoqlpdplfu.supabase.co:5432/postgres";
  try {
    const sql = postgres(url, { 
        ssl: 'require', 
        connect_timeout: 10,
        host: '2406:da12:557:f802:5399:88de:5f6c:d2be'
    });
    const result = await sql`SELECT NOW()`;
    console.log("SUCCESS!", result);
    process.exit(0);
  } catch (err) {
    console.error("FAIL", err);
    process.exit(1);
  }
}
test();
