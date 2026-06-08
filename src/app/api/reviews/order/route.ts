import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      throw error;
    }

    return NextResponse.json(reviews || []);
  } catch (error: any) {
    console.error("Order Reviews API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
