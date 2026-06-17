import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json({ error: "Missing Agent Identity" }, { status: 400 });
    }

    // 1. Get exact orders assigned to this Agent UUID via fleet_tracking
    const { data: fleetAssignments, error: fleetError } = await supabase
      .from('fleet_tracking')
      .select('order_id')
      .eq('agent_id', agentId);

    if (fleetError) throw fleetError;

    const assignedOrderIds = fleetAssignments?.map(f => f.order_id) || [];

    if (assignedOrderIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch those specific orders securely
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('id', assignedOrderIds)
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
