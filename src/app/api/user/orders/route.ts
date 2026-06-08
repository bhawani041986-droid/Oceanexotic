import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    // Fetch orders for this user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    let allOrderItems: any[] = [];
    if (orders && orders.length > 0) {
      const orderIds = orders.map((o: any) => o.id);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id')
        .in('order_id', orderIds);
        
      if (!itemsError && items) {
        allOrderItems = items;
      }
    }

    // Map to the format the frontend expects
    const mappedOrders = (orders || []).map((order: any) => {
      const orderItemsCount = allOrderItems.filter(item => item.order_id === order.id).length;
      return {
        id: order.id,
        is_pre_order: order.is_pre_order,
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: orderItemsCount,
        total: order.total_amount
      };
    });

    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error("User Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
