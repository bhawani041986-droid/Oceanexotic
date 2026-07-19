import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json({ error: "Missing Agent Identity" }, { status: 400 });
    }

    // 0. Resolve the Agent's details if they passed a UUID
    const { data: agentData } = await supabase.from('users').select('email, name').eq('id', agentId).single();
    const agentEmail = agentData?.email || agentId;
    const agentName = agentData?.name || agentId;

    // 1. Get exact orders assigned to this Agent via fleet_tracking
    // We match by UUID, Email, or Name since legacy assignments vary in format
    const { data: fleetAssignments, error: fleetError } = await supabase
      .from('fleet_tracking')
      .select('order_id, agent_id, agent_name');

    if (fleetError) throw fleetError;

    const matchedAssignments = fleetAssignments?.filter(f => {
      const isIdMatch = f.agent_id === agentId;
      const isEmailMatch = f.agent_id && agentEmail && String(f.agent_id).toLowerCase() === String(agentEmail).toLowerCase();
      const isNameMatch1 = f.agent_id && agentName && String(f.agent_id).toLowerCase() === String(agentName).toLowerCase();
      const isNameMatch2 = f.agent_name && agentName && String(f.agent_name).toLowerCase() === String(agentName).toLowerCase();
      return isIdMatch || isEmailMatch || isNameMatch1 || isNameMatch2;
    }) || [];

    // Convert string "ORD-123" to integer 123 for the orders table
    const assignedOrderIds = matchedAssignments
      ?.filter(f => !String(f.order_id).startsWith('LIVE_AGENT_'))
      .map(f => parseInt(String(f.order_id).replace(/\D/g, ""), 10))
      .filter(id => !isNaN(id)) || [];

    if (assignedOrderIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch those specific orders securely using the numeric IDs
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('id', assignedOrderIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Fetch user details for these orders
    const userIds = [...new Set((orders || []).map(o => o.user_id).filter(Boolean))];
    const { data: usersData } = userIds.length > 0 
      ? await supabase.from('users').select('id, name').in('id', userIds)
      : { data: [] };
    
    const userMap = new Map((usersData || []).map(u => [u.id, u.name]));

    // Transform into the specific mission structure expected by the Agent Frontend
    const missions = (orders || []).map(order => {
      const addressParts = (order.delivery_address || "").split(" | Phone: ");
      const displayAddress = addressParts[0];
      const customerPhone = addressParts[1] || "";
      
      return {
        id: `ORD-${order.id}`,
        original_id: order.id,
        customer: userMap.get(order.user_id) || order.user_id || "GUEST CITIZEN",
        customer_phone: customerPhone,
        time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: order.status,
        location: displayAddress || order.delivery_area || "Port Blair",
        is_pre_order: order.is_pre_order || 0,
        urgency: order.shipping_method === 'EXPRESS' ? 'HIGH' : 'NORMAL',
        agent_details: {
          name: order.delivery_agent_name || `AGENT-${agentId}`,
          tracking: order.tracking_number || "AWAITING-SYNC",
          method: order.shipping_method || "STANDARD"
        }
      };
    });

    return NextResponse.json(missions);
  } catch (error: any) {
    console.error("Agent Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
