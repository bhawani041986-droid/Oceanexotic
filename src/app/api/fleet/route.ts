import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// --- AGENT SIGNAL HANDSHAKE (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, lat, lng, temp, status, log_entry } = body;

    if (!order_id || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing Telemetry Nodes" }, { status: 400 });
    }

    // --- UPSERT FLEET REGISTRY ---
    // Check if order exists in fleet tracking
    const existing = await queryOne("SELECT order_id FROM fleet_tracking WHERE order_id = ?", [order_id]);

    if (existing) {
      await query(
        "UPDATE fleet_tracking SET current_lat = ?, current_lng = ?, current_temp = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE order_id = ?",
        [lat, lng, temp || -20.0, status || 'IN_TRANSIT', order_id],
        'UPDATE'
      );
    } else {
      await query(
        "INSERT INTO fleet_tracking (order_id, agent_id, agent_name, current_lat, current_lng, current_temp, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [order_id, 'AGENT-007', 'Vikram S.', lat, lng, temp || -20.0, status || 'ASSIGNED'],
        'INSERT'
      );
    }

    // --- ADD LOG ENTRY ---
    if (log_entry) {
      await query(
        "INSERT INTO fleet_logs (order_id, status, location_name) VALUES (?, ?, ?)",
        [order_id, log_entry.status || status, log_entry.location || 'Current Position'],
        'INSERT'
      );
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
      const allFleet = await query("SELECT * FROM fleet_tracking ORDER BY last_updated DESC");
      return NextResponse.json(allFleet.data);
    }

    // Fetch Specific Order Telemetry
    const data = await queryOne("SELECT * FROM fleet_tracking WHERE order_id = ?", [order_id]);

    if (!data) {
      return NextResponse.json({ error: "Order Not in Active Fleet" }, { status: 404 });
    }

    // Fetch Logs for this order
    const logs = await query("SELECT status, location_name as location, timestamp as time FROM fleet_logs WHERE order_id = ? ORDER BY timestamp DESC", [order_id]);
    
    // Format logs for frontend
    const formattedLogs = logs.data.map((l: any) => ({
      ...l,
      time: new Date(l.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true // The latest one is active in UI logic
    }));

    return NextResponse.json({
      ...data,
      logs: formattedLogs
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Telemetry Retrieval Failure: " + error.message }, { status: 500 });
  }
}
