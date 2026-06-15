import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { translateArray } from '@/lib/translate';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const targetLang = request.nextUrl.searchParams.get('lang') || request.headers.get('Accept-Language');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // We do a manual join because there's no FK constraints guaranteeing products relation in Supabase schema
    const { data: catches, error } = await supabase
      .from('todays_catch')
      .select('*')
      .eq('status', 'FRESH');

    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    const { data: products } = await supabase.from('products').select('*');
    const productMap: Record<string, any> = {};
    if (products) {
      products.forEach(p => productMap[p.id] = p);
    }

    const { data: sellers } = await supabase.from('sellers').select('id, name');
    const sellerMap: Record<string, string> = {};
    if (sellers) sellers.forEach(s => sellerMap[s.id] = s.name);

    const mapped = catches.map((c: any) => {
      const p = productMap[c.product_id] || {};
      return {
        ...c,
        name: p.name || `Harvest #${c.product_id}`,
        price_per_kg: p.price || 0,
        image_url: p.image_url,
        seller_name: sellerMap[p.seller_id] || "Unknown",
        seller_id: p.seller_id
      };
    });

    const translated = await translateArray(
      mapped,
      ['name', 'seller_name', 'harbor_node', 'batch_label', 'freshness_label'],
      targetLang
    );

    return NextResponse.json({ status: "success", items: translated });
  } catch (error: any) {
    console.error("Todays Catch API Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
