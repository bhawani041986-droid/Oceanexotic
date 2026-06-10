import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Supabase Broadcast without config.broadcast...");
  
  const chan1 = supabase.channel('test-room');
  const chan2 = supabase.channel('test-room');

  let received = false;

  chan2.on('broadcast', { event: 'webrtc' }, (payload) => {
    console.log("Chan2 received broadcast:", payload);
    received = true;
  });

  await new Promise(resolve => chan2.subscribe((status) => {
    if (status === 'SUBSCRIBED') resolve();
  }));

  await new Promise(resolve => chan1.subscribe((status) => {
    if (status === 'SUBSCRIBED') resolve();
  }));

  console.log("Both subscribed. Sending broadcast from chan1...");
  chan1.send({
    type: 'broadcast',
    event: 'webrtc',
    payload: { message: 'hello world' }
  }).then(res => console.log("Send result:", res))
    .catch(err => console.error("Send error:", err));

  setTimeout(() => {
    console.log("Test finished. Received?", received);
    process.exit(0);
  }, 3000);
}

test();
