import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { translateArray } from '@/lib/translate';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const targetLang = request.headers.get('Accept-Language');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Products List Error:", error);
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    const { data: sellers } = await supabase.from('sellers').select('id, name');
    const sellerMap: Record<string, string> = {};
    if (sellers) {
      sellers.forEach(s => { sellerMap[s.id] = s.name; });
    }

    const mapped = products.map((p: any) => {
      // Parse description metadata
      let parsedDesc = p.description || '';
      let discountPercent = 0;
      const matchMeta = parsedDesc.match(/<!--METADATA-([\s\S]*?)-METADATA-->/);
      if (matchMeta && matchMeta[1]) {
        try {
          const meta = JSON.parse(matchMeta[1]);
          discountPercent = meta.discount_percent || 0;
        } catch (_) {}
      }

      return {
        ...p,
        discount_percent: discountPercent,
        description: parsedDesc.replace(/<!--METADATA-[\s\S]*?-METADATA-->/g, '').trim(),
        image: p.image_url,
        sellerName: sellerMap[p.seller_id] || "Unknown Seller",
        sellerId: p.seller_id,
        delivery: "90 MIN"
      };
    });

    const translated = await translateArray(
      mapped,
      ['name', 'description', 'category', 'tagline', 'sellerName'],
      targetLang
    );

    return NextResponse.json({ status: "success", products: translated });
  } catch (error: any) {
    console.error("Products List API Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
