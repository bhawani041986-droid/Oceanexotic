global.WebSocket = class {};

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching existing products...");
  const { data: products, error: pError } = await supabase.from('products').select('id, name').limit(10);
  
  if (pError) {
    console.error("Error fetching products:", pError);
    return;
  }
  
  console.log("Available Product IDs:", products.map(p => `${p.id} (${p.name})`));

  // Let's check what product_videos records already exist
  console.log("\nFetching existing product_videos...");
  const { data: existingVideos, error: vError } = await supabase.from('product_videos').select('*');
  if (vError) {
    console.error("Error fetching product_videos:", vError);
    return;
  }
  console.log("Current product_videos:", existingVideos);

  // Define some reels to insert using the video provided by the user
  const videoUrl = "https://oceanexotic.com/videos/oceanexotic_app_intro_final.mp4";
  const thumbnailPlaceholder = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400";
  
  const reelsToInsert = [];
  
  // Link to the first few products found in database
  const targetProductIds = products.slice(0, 3).map(p => p.id);
  
  const titles = [
    "Introducing OceanExotic: Fresh Dock Catch Premium App Experience",
    "Hand-picked Live Harbor Selections: Direct to Your Kitchen",
    "Premium Quality Cold-Chain Logistics: 100% Traceable Seafood"
  ];

  targetProductIds.forEach((prodId, idx) => {
    reelsToInsert.push({
      product_id: prodId,
      video_url: videoUrl,
      title: titles[idx] || `OceanExotic Reels - Fresh Selection ${idx + 1}`,
      is_active: 1,
      sort_order: idx + 1
    });
  });

  console.log("\nInserting new reels:", reelsToInsert);

  // Clear existing active video records first if any, or just insert
  // Since is_active is 1, let's insert them!
  const { data: inserted, error: iError } = await supabase.from('product_videos').insert(reelsToInsert).select();
  if (iError) {
    console.error("Error inserting reels:", iError);
  } else {
    console.log("Success! Inserted video reels:", inserted);
  }
}

run();
