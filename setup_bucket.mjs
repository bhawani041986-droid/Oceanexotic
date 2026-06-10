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

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
  console.log("Checking buckets...");
  const { data: buckets } = await supabase.storage.listBuckets();
  
  const hasAssets = buckets?.some(b => b.name === 'assets');
  if (!hasAssets) {
      console.log("Creating 'assets' bucket...");
      const { data, error } = await supabase.storage.createBucket('assets', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
      });
      if (error) console.error("Error creating bucket:", error);
      else console.log("Bucket created successfully.");
  } else {
      console.log("'assets' bucket already exists.");
  }
}

setupBucket();
