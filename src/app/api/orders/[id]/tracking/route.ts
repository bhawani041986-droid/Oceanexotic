import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPhpServerUrl } from '@/config/api';

// Stage-based ETA durations in minutes (Port Blair local delivery)
const STAGE_DURATIONS: Record<string, number> = {
  PENDING: 0,
  ACCEPTED: 15,    // Seller processing
  PREPARING: 30,   // Cleaning, gutting, ice-packing
  PACKED: 5,       // Ready for pickup
  ASSIGNED: 10,    // Rider en route to seller
  IN_TRANSIT: 45,  // Actual delivery time across island
  DELIVERED: 0,
};

function calculateDynamicETA(order: any, fleetTracking: any) {
  const now = new Date();
  let baseEta = order.estimated_delivery ? new Date(order.estimated_delivery) : new Date(now.getTime() + 120 * 60000);
  
  if (fleetTracking?.estimated_arrival) {
    baseEta = new Date(fleetTracking.estimated_arrival);
  } else if (order.status) {
    // Dynamically adjust ETA based on current stage remaining
    const stages = Object.keys(STAGE_DURATIONS);
    const currentIndex = stages.indexOf(order.status);
    
    if (currentIndex !== -1 && currentIndex < stages.length - 1) {
      let remainingMinutes = 0;
      for (let i = currentIndex; i < stages.length; i++) {
        remainingMinutes += STAGE_DURATIONS[stages[i]];
      }
      baseEta = new Date(now.getTime() + remainingMinutes * 60000);
    }
  }

  // Format as "01:45 PM IST"
  const formattedEta = baseEta.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata', // Andaman matches IST
  }) + ' IST';

  return {
    raw: baseEta.toISOString(),
    formatted: formattedEta,
    isDelayed: baseEta.getTime() < now.getTime(),
    isLive: fleetTracking?.status === 'ACTIVE'
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production') {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, status, created_at, estimated_delivery, delivery_area, user_id, delivery_address')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const { data: fleetTracking } = await supabase
        .from('fleet_tracking')
        .select('current_lat, current_lng, estimated_arrival, status, last_updated, agent_name, current_temp')
        .eq('order_id', orderId)
        .maybeSingle();

      const etaData = calculateDynamicETA(order, fleetTracking);

      return NextResponse.json({
        id: order.id,
        status: order.status,
        customerArea: order.delivery_area || 'Port Blair',
        customerAddress: order.delivery_address || '',
        eta: etaData,
        fleet: fleetTracking ? {
          lat: fleetTracking.current_lat,
          lng: fleetTracking.current_lng,
          temp: fleetTracking.current_temp || '-18.5',
          agent: fleetTracking.agent_name || 'Assigned Rider',
          lastUpdate: fleetTracking.last_updated
        } : null,
        timeline: [
          { status: 'PENDING', label: 'Order Placed', completed: true },
          { status: 'ACCEPTED', label: 'Seller Accepted', completed: ['ACCEPTED', 'PREPARING', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
          { status: 'PREPARING', label: 'Preparing', completed: ['PREPARING', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
          { status: 'PACKED', label: 'Packed', completed: ['PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
          { status: 'ASSIGNED', label: 'Rider Assigned', completed: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
          { status: 'IN_TRANSIT', label: 'Out for Delivery', completed: ['IN_TRANSIT', 'DELIVERED'].includes(order.status) },
          { status: 'DELIVERED', label: 'Delivered', completed: order.status === 'DELIVERED' }
        ],
      });
    }

    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/orders/tracking.php?id=${orderId}`;
    
    const response = await fetch(phpApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.error || !data.order) {
        return NextResponse.json({ error: data.error || 'Order not found' }, { status: 404 });
    }

    const order = data.order;
    const fleetTracking = data.fleetTracking;

    const etaData = calculateDynamicETA(order, fleetTracking);

    return NextResponse.json({
      id: order.id,
      status: order.status,
      customerArea: order.delivery_area || 'Port Blair',
      customerAddress: order.delivery_address || '',
      eta: etaData,
      fleet: fleetTracking ? {
        lat: fleetTracking.current_lat,
        lng: fleetTracking.current_lng,
        temp: fleetTracking.current_temp || '-18.5',
        agent: fleetTracking.agent_name || 'Assigned Rider',
        lastUpdate: fleetTracking.last_updated
      } : null,
      timeline: [
        { status: 'PENDING', label: 'Order Placed', completed: true },
        { status: 'ACCEPTED', label: 'Seller Accepted', completed: ['ACCEPTED', 'PREPARING', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
        { status: 'PREPARING', label: 'Preparing', completed: ['PREPARING', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
        { status: 'PACKED', label: 'Packed', completed: ['PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
        { status: 'ASSIGNED', label: 'Rider Assigned', completed: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) },
        { status: 'IN_TRANSIT', label: 'Out for Delivery', completed: ['IN_TRANSIT', 'DELIVERED'].includes(order.status) },
        { status: 'DELIVERED', label: 'Delivered', completed: order.status === 'DELIVERED' }
      ],
    });
  } catch (err) {
    console.error('[Tracking API Proxy Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
