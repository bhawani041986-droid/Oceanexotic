import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { translateObject, translateArray } from '@/lib/translate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const area = searchParams.get('area');
    const targetLang = request.headers.get('Accept-Language');

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    // 1. Fetch Product (no join - sellers FK may not be in schema cache)
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: "Product not found" }, { status: 404 });
      throw error;
    }

    // 1.1 Fetch seller name separately (safe separate query)
    let sellerName = 'OceanExotic Seller';
    try {
      if (product.seller_id) {
        const { data: sellerRow } = await supabase
          .from('sellers')
          .select('name')
          .eq('id', product.seller_id)
          .maybeSingle();
        if (sellerRow?.name) sellerName = sellerRow.name;
      }
    } catch (sellerErr) {
      console.error("Error fetching seller name:", sellerErr);
    }
    product.seller_name = sellerName;
    product.sellerName = sellerName;

    // 1.2 Fetch Seller Location from users & territories
    let sellerLocation = 'Port Blair, Andaman';
    try {
      const sellerId = product.seller_id;
      const cleanId = sellerId ? sellerId.replace('SEL-', '') : '';
      const { data: sellerUser } = await supabase
        .from('users')
        .select(`
          territory_id,
          maritime_territories:territory_id (
            name
          )
        `)
        .or(`id.eq.${sellerId},id.eq.${cleanId}`)
        .maybeSingle();

      if (sellerUser && (sellerUser as any).maritime_territories) {
        sellerLocation = (sellerUser as any).maritime_territories.name || sellerLocation;
      }
    } catch (locErr) {
      console.error("Error fetching seller location in API:", locErr);
    }
    
    product.seller_location = sellerLocation || product.harbor_node || 'Port Blair, Andaman';
    product.sellerLocation = sellerLocation || product.harbor_node || 'Port Blair, Andaman';

    // 1.3 Synthesize landed_at if not in DB yet (column may not exist)
    // When landed_at is null/undefined, compute a realistic "this morning" catch time
    if (!product.landed_at) {
      const now = new Date();
      // Set to today at midnight UTC (= 5:30 AM IST)
      const todayMorning = new Date(now);
      todayMorning.setUTCHours(0, 0, 0, 0);
      // If current time is before midnight UTC, use yesterday morning
      if (now.getTime() < todayMorning.getTime()) {
        todayMorning.setUTCDate(todayMorning.getUTCDate() - 1);
      }
      product.landed_at = todayMorning.toISOString();
      product.is_synthetic_landed_at = true;
    }

    // 2. Fetch Cut Options
    const { data: cutOptions } = await supabase
      .from('product_cut_options')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });
    
    product.cut_options = cutOptions || [];

    // 3. Fetch Prep Options
    const { data: prepOptions } = await supabase
      .from('product_prep_options')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });
    
    product.prep_options = prepOptions || [];

    // 4. Fetch Location Overrides
    const { data: locOverrides } = await supabase
      .from('product_location_overrides')
      .select('*')
      .eq('product_id', id);
    
    product.location_overrides = locOverrides || [];

    // Apply area overrides if area is specified
    if (area && product.location_overrides.length > 0) {
      const override = product.location_overrides.find((o: any) => o.territory_name === area);
      if (override) {
        if (override.price !== null) product.price = override.price;
        if (override.stock !== null) product.stock = override.stock;
        if (override.status !== null) product.status = override.status;
      }
    }

    // 5. Fetch Addons
    const { data: allAddons } = await supabase
      .from('addons')
      .select('*')
      .eq('is_active', 1)
      .order('id', { ascending: true });
    
    let filteredAddons = [];
    if (allAddons) {
      // Simplified time-filtering (we'll just pass all active addons to client for simplicity, 
      // or we can filter by area)
      filteredAddons = allAddons.filter((addon: any) => {
        if (area && addon.allowed_areas && addon.allowed_areas.trim() !== '') {
            const allowed = addon.allowed_areas.split(',').map((a: string) => a.trim());
            if (!allowed.includes(area)) {
                return false;
            }
        }
        return true;
      });
    }
    
    product.addons = filteredAddons.map((a: any) => ({
      ...a,
      is_active: 1,
      price: Number(a.price)
    }));

    // Perform translation if target language is specified and not English
    let translatedProduct = product;
    if (targetLang && !targetLang.toLowerCase().startsWith("en")) {
      translatedProduct = await translateObject(product, ['name', 'description', 'category', 'tagline'], targetLang);
      if (translatedProduct.cut_options) {
        translatedProduct.cut_options = await translateArray(translatedProduct.cut_options, ['label'], targetLang);
      }
      if (translatedProduct.prep_options) {
        translatedProduct.prep_options = await translateArray(translatedProduct.prep_options, ['label'], targetLang);
      }
      if (translatedProduct.addons) {
        translatedProduct.addons = await translateArray(translatedProduct.addons, ['name', 'type'], targetLang);
      }
    }

    return NextResponse.json(translatedProduct);
  } catch (error: any) {
    console.error("Product Detail API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
