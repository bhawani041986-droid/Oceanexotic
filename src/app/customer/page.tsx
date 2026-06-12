import { createClient } from "@supabase/supabase-js";
import CustomerHomeClient from "./CustomerHomeClient";

// Server-Side Data Fetching for Flawless On-Page SEO
async function fetchCustomerAssets() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('marketplace_settings')
      .select('setting_value')
      .eq('setting_key', 'customerAssets')
      .single();
    
    if (data && data.setting_value) {
      let assets = data.setting_value;
      if (typeof assets === 'string') assets = JSON.parse(assets);
      return assets;
    }
  } catch (e) {
    console.error("Server-side setting fetch failed:", e);
  }
  return null;
}

export default async function CustomerHomePage() {
  const initialAssets = await fetchCustomerAssets();
  
  return (
    <CustomerHomeClient initialAssets={initialAssets} />
  );
}
