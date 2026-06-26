import postgres from 'postgres';

const projectIds = ['kyqmhibffbwoqlpdplfu', 'iklzcaqqvbrfxevufebi'];
const password = 'Sankar@1986#04';
const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ca-central-1',
  'sa-east-1',
  'ap-east-1'
];

async function testAll() {
  for (const projectId of projectIds) {
    for (const region of regions) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      const url = `postgres://postgres.${projectId}:${encodeURIComponent(password)}@${host}:6543/postgres`;
      try {
        console.log(`Testing ${projectId} on region ${region}...`);
        const sql = postgres(url, { ssl: 'require', connect_timeout: 4 });
        const res = await sql`SELECT NOW()`;
        console.log(`FOUND! ${projectId} on region ${region} succeeded:`, res);
        process.exit(0);
      } catch (err) {
        if (err.message.includes('password') || err.message.includes('authentication')) {
          console.log(`FOUND! ${projectId} on region ${region} matches tenant (but password wrong)`);
          process.exit(0);
        }
        console.log(`Failed: ${err.message.split('\n')[0]}`);
      }
    }
  }
  console.log("None of the combinations succeeded.");
  process.exit(1);
}
testAll();
