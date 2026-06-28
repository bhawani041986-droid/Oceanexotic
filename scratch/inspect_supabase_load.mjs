import postgres from 'postgres';

async function main() {
  const url = "postgres://postgres.kyqmhibffbwoqlpdplfu:Sankar%401986%2304@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
  try {
    const sql = postgres(url, { ssl: 'require', connect_timeout: 15 });
    
    console.log("Checking Database Size...");
    const dbSize = await sql`SELECT pg_size_pretty(pg_database_size('postgres')) AS size`;
    
    console.log("Checking Connections...");
    const connStats = await sql`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active,
        (SELECT count(*) FROM pg_stat_activity) as total
    `;
    
    console.log("Checking Table Stats...");
    const userCount = await sql`SELECT count(*) FROM users`.catch(() => [{ count: 'N/A' }]);
    const productCount = await sql`SELECT count(*) FROM products`.catch(() => [{ count: 'N/A' }]);
    const orderCount = await sql`SELECT count(*) FROM orders`.catch(() => [{ count: 'N/A' }]);
    
    console.log("\n--- SUPABASE LOAD REPORT ---");
    console.log(`Database Size: ${dbSize[0].size}`);
    console.log(`Active Database Connections: ${connStats[0].active}`);
    console.log(`Total Database Connections: ${connStats[0].total}`);
    console.log(`Total Registered Users: ${userCount[0].count}`);
    console.log(`Total Products: ${productCount[0].count}`);
    console.log(`Total Orders: ${orderCount[0].count}`);
    console.log("----------------------------\n");
    
    process.exit(0);
  } catch (err) {
    console.error("Failed to fetch Supabase database stats:", err);
    process.exit(1);
  }
}
main();
