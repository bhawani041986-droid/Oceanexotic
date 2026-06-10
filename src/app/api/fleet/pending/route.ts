import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all pending orders that have not been delivered or cancelled
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['PENDING', 'PROCESSING', 'SHIPPED']) // Include orders that might be ready for dispatch
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Format the response
    const pendingOrders = (orders || []).map(order => ({
      order_id: `ORD-${order.id}`,
      customer_name: order.customer_name || 'Customer',
      area: order.delivery_area || 'Port Blair',
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString()
    }));

    return NextResponse.json({ success: true, orders: pendingOrders });

  } catch (error: any) {
    console.error("Fleet Pending Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
