import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) throw orderError;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Fetch items manually to avoid foreign key issues
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      ...order,
      items: items || []
    });
  } catch (error: any) {
    console.error("User Order Details API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
