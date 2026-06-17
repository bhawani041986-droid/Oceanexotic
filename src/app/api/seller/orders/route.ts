import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- GET: Fetch orders for seller view ---
export async function GET(request: Request) {
  try {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        customer_name,
        delivery_agent_name,
        delivery_agent_phone,
        shipping_method,
        tracking_number,
        estimated_delivery
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedOrders = (ordersData || []).map((order: any) => ({
      id: order.id,
      product: 'Premium Catch',
      customer: order.customer_name || 'Customer',
      customer_name: order.customer_name || 'Customer',
      total: `\u20b9${Number(order.total_amount).toLocaleString()}`,
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString(),
      delivery_agent_name: order.delivery_agent_name || null,
      delivery_agent_phone: order.delivery_agent_phone || null,
      shipping_method: order.shipping_method || null,
      tracking_number: order.tracking_number || null,
      estimated_delivery: order.estimated_delivery || null,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: Seller assigns rider and dispatches order ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status,
      delivery_agent_name,
      delivery_agent_phone,
      shipping_method,
      tracking_number,
      estimated_delivery
    } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }
    if (!delivery_agent_name) {
      return NextResponse.json({ error: 'Please select a delivery agent' }, { status: 400 });
    }

    // Look up real agent name from the agent registry
    const { data: agentUser } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', delivery_agent_name)
      .single();

    const resolvedName = agentUser?.name || delivery_agent_name;
    const resolvedPhone = agentUser?.phone || delivery_agent_phone || '';

    const updates: any = {
      status: status || 'SHIPPED',
      delivery_agent_name: resolvedName,
      delivery_agent_phone: resolvedPhone,
    };
    if (shipping_method) updates.shipping_method = shipping_method;
    if (tracking_number) updates.tracking_number = tracking_number;
    if (estimated_delivery) updates.estimated_delivery = estimated_delivery;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order_id);

    if (error) throw error;

    // Also upsert into fleet_tracking so agent tracking map shows immediately
    await supabase.from('fleet_tracking').upsert({
      order_id,
      agent_id: delivery_agent_name,
      agent_name: resolvedName,
      current_lat: 11.667,
      current_lng: 92.7359,
      status: 'ASSIGNED',
      last_updated: new Date().toISOString(),
    }, { onConflict: 'order_id' });

    return NextResponse.json({ success: true, message: 'Rider assigned and order dispatched.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
