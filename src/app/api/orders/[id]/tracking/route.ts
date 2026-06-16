import { NextRequest, NextResponse } from 'next/server';
import { getPhpServerUrl } from '@/config/api';

// Stage-based ETA durations in minutes (Port Blair local delivery)
const STAGE_DURATIONS: Record<string, number> = {
  PENDING: 20,          // Seller acceptance window
  CONFIRMED: 20,        // Seafood preparation
  PREPARING: 15,        // Packing
  PACKED: 6,            // Rider assignment
  DISPATCHED: 44,       // Travel time (Port Blair avg)
  OUT_FOR_DELIVERY: 30, // Final leg delivery
};

// Total worst-case ETA from order placement (minutes)
const TOTAL_ETA_FROM_ORDER = 105;

function calculateDynamicETA(order: any, fleetTracking: any): {
  minutesRemaining: number;
  status: string;
  estimatedDeliveryAt: string;
  driverLocation: { latitude: number; longitude: number } | null;
  lastUpdated: string;
  stage: string;
  stageLabel: string;
} {
  const now = new Date();
  const orderCreatedAt = new Date(order.created_at);
  const status = (order.status || 'PENDING').toUpperCase();

  // If already delivered
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    return {
      minutesRemaining: 0,
      status: 'delivered',
      estimatedDeliveryAt: order.delivered_at || now.toISOString(),
      driverLocation: null,
      lastUpdated: now.toISOString(),
      stage: 'DELIVERED',
      stageLabel: 'Delivered',
    };
  }

  // If cancelled
  if (status === 'CANCELLED') {
    return {
      minutesRemaining: 0,
      status: 'cancelled',
      estimatedDeliveryAt: '',
      driverLocation: null,
      lastUpdated: now.toISOString(),
      stage: 'CANCELLED',
      stageLabel: 'Cancelled',
    };
  }

  let minutesRemaining = TOTAL_ETA_FROM_ORDER;
  let estimatedDeliveryAt: Date;

  // Use fleet_tracking estimated_arrival if available
  if (fleetTracking?.estimated_arrival) {
    const fleetETA = new Date(fleetTracking.estimated_arrival);
    if (!isNaN(fleetETA.getTime()) && fleetETA > now) {
      minutesRemaining = Math.max(1, Math.round((fleetETA.getTime() - now.getTime()) / 60000));
      estimatedDeliveryAt = fleetETA;
    } else {
      // Fleet ETA exists but may be stale — recalculate from stage
      const stageMins = calculateRemainingFromStage(status, orderCreatedAt, now);
      minutesRemaining = stageMins;
      estimatedDeliveryAt = new Date(now.getTime() + stageMins * 60000);
    }
  } else {
    // No fleet tracking — calculate from order stage + elapsed time
    const stageMins = calculateRemainingFromStage(status, orderCreatedAt, now);
    minutesRemaining = stageMins;
    estimatedDeliveryAt = new Date(now.getTime() + stageMins * 60000);
  }

  // Clamp to avoid negative or absurd values
  minutesRemaining = Math.max(1, Math.min(minutesRemaining, 180));

  const driverLocation = fleetTracking ? {
    latitude: parseFloat(fleetTracking.current_lat) || 11.6234,
    longitude: parseFloat(fleetTracking.current_lng) || 92.7265,
  } : null;

  const stageInfo = getStageInfo(status);

  return {
    minutesRemaining,
    status: mapStatusToTrackingStatus(status),
    estimatedDeliveryAt: estimatedDeliveryAt!.toISOString(),
    driverLocation,
    lastUpdated: fleetTracking?.last_updated || now.toISOString(),
    stage: status,
    stageLabel: stageInfo.label,
  };
}

function calculateRemainingFromStage(status: string, createdAt: Date, now: Date): number {
  const elapsedMins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

  // Build cumulative stage timeline
  const stages = ['PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY'];
  let cumulativeMins = 0;

  for (const stage of stages) {
    const stageDuration = STAGE_DURATIONS[stage] || 10;
    if (stage === status) {
      // We're in this stage — remaining = rest of this stage + all future stages
      const remainingInStage = Math.max(0, stageDuration - (elapsedMins - cumulativeMins));
      const futureStages = stages.slice(stages.indexOf(stage) + 1);
      const futureMins = futureStages.reduce((sum, s) => sum + (STAGE_DURATIONS[s] || 10), 0);
      return remainingInStage + futureMins;
    }
    cumulativeMins += stageDuration;
  }

  // Fallback: order just placed, use full ETA
  return Math.max(1, TOTAL_ETA_FROM_ORDER - elapsedMins);
}

function mapStatusToTrackingStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    PACKED: 'packed',
    DISPATCHED: 'out_for_delivery',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  return map[status] || 'pending';
}

function getStageInfo(status: string): { label: string; icon: string } {
  const map: Record<string, { label: string; icon: string }> = {
    PENDING: { label: 'Order Placed', icon: '📋' },
    CONFIRMED: { label: 'Seller Accepted', icon: '✅' },
    PREPARING: { label: 'Preparing Order', icon: '🔪' },
    PACKED: { label: 'Packed & Ready', icon: '📦' },
    DISPATCHED: { label: 'Rider Assigned', icon: '🏍️' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: '🚚' },
    DELIVERED: { label: 'Delivered', icon: '🎉' },
    CANCELLED: { label: 'Cancelled', icon: '❌' },
  };
  return map[status] || { label: 'Processing', icon: '⏳' };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = await response.json();
    
    if (data.error || !data.order) {
        return NextResponse.json({ error: data.error || 'Order not found' }, { status: 404 });
    }

    const order = data.order;
    const fleetTracking = data.fleetTracking;

    const etaData = calculateDynamicETA(order, fleetTracking);

    return NextResponse.json({
      order_id: orderId,
      status: etaData.status,
      stage: etaData.stage,
      stage_label: etaData.stageLabel,
      minutes_remaining: etaData.minutesRemaining,
      estimated_delivery_at: etaData.estimatedDeliveryAt,
      driver_location: etaData.driverLocation,
      driver_name: fleetTracking?.agent_name || null,
      current_temp: fleetTracking?.current_temp || -18.0,
      delivery_area: order.delivery_area || 'Port Blair',
      last_updated: etaData.lastUpdated,
      // Stage progression for UI pipeline
      stages: [
        { key: 'PENDING', label: 'Order Placed', done: true },
        { key: 'CONFIRMED', label: 'Seller Accepted', done: ['CONFIRMED','PREPARING','PACKED','DISPATCHED','OUT_FOR_DELIVERY','DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'PREPARING', label: 'Preparing', done: ['PREPARING','PACKED','DISPATCHED','OUT_FOR_DELIVERY','DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'PACKED', label: 'Packed', done: ['PACKED','DISPATCHED','OUT_FOR_DELIVERY','DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'DISPATCHED', label: 'Rider Assigned', done: ['DISPATCHED','OUT_FOR_DELIVERY','DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', done: ['OUT_FOR_DELIVERY','DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'DELIVERED', label: 'Delivered', done: order.status?.toUpperCase() === 'DELIVERED' },
      ],
    });
  } catch (err) {
    console.error('[Tracking API Proxy Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
