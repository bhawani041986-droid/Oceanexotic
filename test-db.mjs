import postgres from 'postgres';

async function test() {
  const url = "postgres://postgres:Sankar%401986%2304@db.kyqmhibffbwoqlpdplfu.supabase.co:6543/postgres";
  try {
    const sql = postgres(url, { ssl: 'require', connect_timeout: 10 });
    const result = await sql`SELECT NOW()`;
    console.log("SUCCESS!", result);
    process.exit(0);
  } catch (err) {
    console.error("FAIL", err);
    process.exit(1);
  }
}
test();
