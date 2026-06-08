import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const mapped = products.map((p: any) => ({
      ...p,
      image: p.image_url,
      sellerName: sellerMap[p.seller_id] || "Unknown Seller",
      sellerId: p.seller_id,
      delivery: "90 MIN"
    }));

    return NextResponse.json({ status: "success", products: mapped });
  } catch (error: any) {
    console.error("Products List API Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
