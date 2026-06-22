import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRODUCT_CATEGORIES as FALLBACK_CATEGORIES } from '@/constants/categories';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('setting_value')
      .eq('setting_key', 'PRODUCT_CATEGORIES')
      .single();

    if (error || !data) {
      return NextResponse.json(FALLBACK_CATEGORIES);
    }

    const categories = JSON.parse(data.setting_value);
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(FALLBACK_CATEGORIES);
  }
}

export async function POST(req: NextRequest) {
  try {
    const newCategories = await req.json();
    
    // We enforce array structure
    if (!Array.isArray(newCategories)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('marketplace_settings')
      .upsert({
        setting_key: 'PRODUCT_CATEGORIES',
        setting_value: JSON.stringify(newCategories),
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
