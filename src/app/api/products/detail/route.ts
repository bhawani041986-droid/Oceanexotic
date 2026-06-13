import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const area = searchParams.get('area');

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    // 1. Fetch Product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: "Product not found" }, { status: 404 });
      throw error;
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

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product Detail API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
