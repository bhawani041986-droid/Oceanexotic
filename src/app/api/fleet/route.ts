import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- AGENT SIGNAL HANDSHAKE (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, lat, lng, temp, status, log_entry, agent_name } = body;

    if (!order_id || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing Telemetry Nodes" }, { status: 400 });
    }

    // --- UPSERT FLEET REGISTRY ---
    const { error: upsertError } = await supabase
      .from('fleet_tracking')
      .upsert({
        order_id,
        agent_id: `AGT-${Math.floor(Math.random() * 1000)}`,
        agent_name: agent_name || 'UNASSIGNED AGENT',
        current_lat: lat,
        current_lng: lng,
        current_temp: temp || -20.0,
        status: status || 'IN_TRANSIT',
        last_updated: new Date().toISOString()
      }, { onConflict: 'order_id' });

    if (upsertError) throw upsertError;

    // --- ADD LOG ENTRY ---
    if (log_entry) {
      const { error: logError } = await supabase.from('fleet_logs').insert([{
        order_id,
        status: log_entry.status || status,
        location_name: log_entry.location || 'Current Position'
      }]);
      if (logError) throw logError;
    }

    return NextResponse.json({ success: true, message: "Signal Registered in Sovereign Spine" });
  } catch (error: any) {
    console.error("❌ Fleet Signal Error:", error);
    return NextResponse.json({ error: "Signal Drift: " + error.message }, { status: 500 });
  }
}

// --- TELEMETRY DELIVERY (GET) ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      // Admin Discovery Mode: Return all active fleet nodes
      const { data: allFleet, error } = await supabase.from('fleet_tracking').select('*').order('last_updated', { ascending: false });
      if (error) throw error;
      return NextResponse.json(allFleet || []);
    }

    // Fetch Specific Order Telemetry
    const { data: trackingData, error: trackingError } = await supabase.from('fleet_tracking').select('*').eq('order_id', order_id).single();

    if (trackingError && trackingError.code !== 'PGRST116') throw trackingError;
    if (!trackingData) {
      return NextResponse.json({ error: "Order Not in Active Fleet" }, { status: 404 });
    }

    // Fetch Logs for this order
    const { data: logsData, error: logsError } = await supabase.from('fleet_logs').select('status, location_name, timestamp').eq('order_id', order_id).order('timestamp', { ascending: false });
    if (logsError) throw logsError;
    
    // Format logs for frontend
    const formattedLogs = (logsData || []).map((l: any) => ({
      status: l.status,
      location: l.location_name,
      time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true // The latest one is active in UI logic
    }));

    return NextResponse.json({
      ...trackingData,
      logs: formattedLogs
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Telemetry Retrieval Failure: " + error.message }, { status: 500 });
  }
}
