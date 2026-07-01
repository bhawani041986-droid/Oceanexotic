const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = 'https://kyqmhibffbwoqlpdplfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false }, global: { fetch: fetch }, realtime: { transport: ws } });

const CATEGORIES = [
  { id: 'SEAWATER FISH', label: 'Seawater Fish', iconName: 'Anchor', status: 'ACTIVE', slug: 'seawater', file: 'seawater.jpg' },
  { id: 'FRESHWATER FISH', label: 'Freshwater Fish', iconName: 'Fish', status: 'ACTIVE', slug: 'freshwater', file: 'freshwater.jpg' },
  { id: 'PRAWNS & SHRIMPS', label: 'Prawns & Shrimps', iconName: 'Activity', status: 'ACTIVE', slug: 'prawns', file: 'prawns.jpg' },
  { id: 'CRABS & LOBSTERS', label: 'Crabs & Lobsters', iconName: 'Compass', status: 'ACTIVE', slug: 'crustaceans', file: 'crabs.jpg' },
  { id: 'STEAKS & FILLETS', label: 'Premium Steaks & Fillets', iconName: 'Star', status: 'ACTIVE', slug: 'fillets', file: 'steaks.jpg' },
  { id: 'EXOTIC CATCH', label: 'Exotic Catch', iconName: 'Anchor', status: 'ACTIVE', slug: 'exotic', file: 'exotic.jpg' },
  { id: 'READY TO COOK', label: 'Ready To Cook', iconName: 'Zap', status: 'ACTIVE', slug: 'ready-to-cook', file: 'ready.jpg' },
  { id: 'DRY FISH', label: 'Dry Fish', iconName: 'Leaf', status: 'ACTIVE', slug: 'dry-fish', file: 'dry_fish.jpg' },
  { id: 'MUTTON', label: 'Mutton', iconName: 'Beef', status: 'ACTIVE', slug: 'mutton', file: 'mutton.jpg' },
  { id: 'CHICKEN', label: 'Chicken', iconName: 'Utensils', status: 'ACTIVE', slug: 'chicken', file: 'chicken.jpg' }
];

async function run() {
  const finalCategories = [];
  
  for (const cat of CATEGORIES) {
    const filePath = path.join(__dirname, 'apps/customer-app/assets/categories', cat.file);
    const buffer = fs.readFileSync(filePath);
    
    const fileName = `categories/${cat.file}`;
    const { data, error } = await supabase.storage
      .from("assets")
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (error) {
      console.error("Error uploading", cat.file, error);
      continue;
    }
    
    let publicUrlData = supabase.storage.from("assets").getPublicUrl(fileName).data;
    let publicUrl = publicUrlData.publicUrl.replace('https://kyqmhibffbwoqlpdplfu.supabase.co/storage/v1/object/public/assets', 'https://oceanexotic.com/storage');
    
    finalCategories.push({
      id: cat.id,
      label: cat.label,
      iconName: cat.iconName,
      status: cat.status,
      imageUrl: publicUrl
    });
    console.log(`Uploaded ${cat.file} -> ${publicUrl}`);
  }
  
  // Upsert to marketplace_settings
  const { error: dbError } = await supabase
      .from('marketplace_settings')
      .upsert({
        setting_key: 'PRODUCT_CATEGORIES',
        setting_value: JSON.stringify(finalCategories),
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });
      
  if (dbError) {
     console.error("DB Error:", dbError);
  } else {
     console.log("Successfully updated PRODUCT_CATEGORIES in database!");
  }
}

run();
