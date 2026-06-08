import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    // Fetch all reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Reviews GET error:", error);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    // Fetch all sellers for mapping
    const { data: sellers } = await supabase.from('sellers').select('id, name');
    const sellerMap: Record<string, string> = {};
    if (sellers) {
      sellers.forEach(s => {
        sellerMap[s.id] = s.name;
      });
    }

    // Map seller_name for the frontend
    const mapped = reviews.map((r: any) => ({
      ...r,
      seller_name: sellerMap[r.seller_id] || "Unknown Seller"
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Reviews API GET Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
