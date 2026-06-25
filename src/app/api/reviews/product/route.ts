import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPhpServerUrl } from '@/config/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production') {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return NextResponse.json(reviews || []);
    }

    // Local Dev proxy to PHP API
    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/reviews/product.php?product_id=${productId}`;
    
    const response = await fetch(phpApiUrl, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
    
  } catch (error: any) {
    console.error("Product Reviews API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
