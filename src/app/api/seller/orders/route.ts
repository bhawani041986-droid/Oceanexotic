import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller_id');

    let query = supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        customer_name,
        customer_id
      `)
      .order('created_at', { ascending: false });

    const { data: ordersData, error } = await query;
    if (error) throw error;

    const formattedOrders = ordersData.map((order: any) => {
        return {
            id: order.id,
            product: 'Premium Catch', // Mocked until we join with order_items properly
            customer: order.customer_name || 'Customer',
            total: `₹${Number(order.total_amount).toLocaleString()}`,
            status: order.status,
            date: new Date(order.created_at).toLocaleDateString()
        };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
