import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('product_id');
    const area = req.nextUrl.searchParams.get('area');
    
    if (!productId) {
      return NextResponse.json({ status: "error", message: "Missing product_id" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Base Price
    const { data: product } = await supabase.from('products').select('price').eq('id', productId).single();
    let basePrice = product?.price || 0;

    // Apply Location Overrides
    if (area) {
      const { data: override } = await supabase.from('product_location_overrides').select('price').eq('product_id', productId).eq('territory_name', area).single();
      if (override && override.price !== null) {
        basePrice = override.price;
      }
    }

    // Fetch Cuts
    const { data: cuts, error } = await supabase
      .from('product_cut_options')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    // Emulate PHP Metadata
    const labels: Record<string, any> = {
        'WHOLE':      { label: 'Whole Fish',    desc: 'Full fish, as caught',          icon: '🐟' },
        'CURRY_CUT':  { label: 'Curry Cut',     desc: 'Pieces ready for curry',        icon: '🍛' },
        'STEAK_CUT':  { label: 'Steak Cut',     desc: 'Thick cross-section steaks',    icon: '🥩' },
        'FILLET':     { label: 'Fillet',        desc: 'Boneless, skin-on slabs',       icon: '🍽️' },
        'CLEANED':    { label: 'Cleaned',       desc: 'Gutted & scaled, ready to cook',icon: '✨' },
        'UNCLEANED':  { label: 'Uncleaned',     desc: 'As-is from harbor',             icon: '🌊' },
        'HEAD_ON':    { label: 'Head On',       desc: 'Full head retained',            icon: '🐠' },
        'HEAD_OFF':   { label: 'Head Off',      desc: 'Head removed',                  icon: '✂️' },
        'SKIN_ON':    { label: 'Skin On',       desc: 'Natural skin retained',         icon: '🔵' },
        'SKIN_OFF':   { label: 'Skin Off',      desc: 'Skin removed for easy cooking', icon: '⚪' },
    };

    const enriched = (cuts || [])
      .filter((c: any) => c.is_available === 1 || c.is_available === true)
      .map((c: any) => {
      const meta = labels[c.cut_type] || { label: c.cut_type, desc: '', icon: '🐟' };
      const finalPrice = Math.round(Number(basePrice) * (1 + Number(c.price_modifier_percent || 0) / 100) + Number(c.price_flat_add || 0));
      return {
        ...c,
        ...meta,
        is_available: true,
        final_price: finalPrice,
        price_modifier_percent: Number(c.price_modifier_percent),
        price_flat_add: Number(c.price_flat_add),
      };
    });

    return NextResponse.json({ status: "success", product_id: productId, base_price: basePrice, cut_options: enriched });
  } catch (error: any) {
    console.error("Cut Options API Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
