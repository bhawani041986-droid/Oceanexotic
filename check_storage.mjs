import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envStr = '';
try { envStr = fs.readFileSync('.env.local', 'utf8'); } catch(e) {}
if (!envStr) {
  try { envStr = fs.readFileSync('.env', 'utf8'); } catch(e) {}
}

const getEnv = (key) => {
  const match = envStr.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseKey) {
  console.log("No Supabase key found in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  console.log("Fetching buckets...");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.error("Bucket Error:", bucketError);
    return;
  }
  
  console.log("Buckets:", buckets?.map(b => b.name));

  for (const bucket of buckets || []) {
      console.log(`\nListing files in bucket '${bucket.name}' (root):`);
      const { data: files, error: fileError } = await supabase.storage.from(bucket.name).list();
      if (fileError) {
          console.error(`Error listing ${bucket.name}:`, fileError);
      } else {
          console.log(files?.slice(0, 5).map(f => f.name));
      }
      
      console.log(`Listing files in bucket '${bucket.name}' (optimized/):`);
      const { data: optFiles } = await supabase.storage.from(bucket.name).list('optimized');
      console.log(optFiles?.slice(0, 5).map(f => f.name));
  }
}

checkStorage();
