import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json({ error: "Missing Agent Identity" }, { status: 400 });
    }

    // In a real application, we would map the integer agentId to the delivery_agent_name.
    // For this prototype, we'll fetch orders where delivery_agent_name is not null.
    // We will simulate fetching missions assigned to this agent.
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      // .eq('delivery_agent_name', agentName) 
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Transform into the specific mission structure expected by the Agent Frontend
    const missions = (orders || []).map(order => ({
      id: `ORD-${order.id}`,
      original_id: order.id,
      customer: order.user_id || "GUEST CITIZEN",
      time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: order.status,
      location: order.delivery_address || order.delivery_area || "Port Blair",
      is_pre_order: order.is_pre_order || 0,
      urgency: order.shipping_method === 'EXPRESS' ? 'HIGH' : 'NORMAL',
      agent_details: {
        name: order.delivery_agent_name || `AGENT-${agentId}`,
        tracking: order.tracking_number || "AWAITING-SYNC",
        method: order.shipping_method || "STANDARD"
      }
    }));

    return NextResponse.json(missions);
  } catch (error: any) {
    console.error("Agent Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
