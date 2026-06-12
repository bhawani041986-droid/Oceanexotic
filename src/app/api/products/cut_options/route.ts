import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('product_id');
    if (!productId) {
      return NextResponse.json({ status: "error", message: "Missing product_id" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cuts, error } = await supabase
      .from('product_cut_options')
      .select('*')
      .eq('product_id', productId)
      .eq('is_available', 1);

    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    const { data: product } = await supabase.from('products').select('price').eq('id', productId).single();
    const basePrice = product?.price || 0;

    const mapped = cuts.map((c: any) => ({
      ...c,
      label: c.cut_type,
      final_price: Number(basePrice) + Number(c.price_flat_add || 0)
    }));

    return NextResponse.json({ status: "success", cut_options: mapped });
  } catch (error: any) {
    console.error("Cut Options API Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
