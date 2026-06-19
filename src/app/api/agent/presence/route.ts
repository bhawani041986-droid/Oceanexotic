import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET Live Agents
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('fleet_tracking')
      .select('*')
      .like('order_id', 'LIVE_AGENT_%')
      .eq('status', 'LIVE');

    if (error) throw error;
    
    // Filter out agents whose last_updated was over 15 minutes ago
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).getTime();
    const activeAgents = (data || []).filter(agent => {
      if (!agent.last_updated) return false;
      return new Date(agent.last_updated).getTime() > fifteenMinsAgo;
    });

    return NextResponse.json(activeAgents);
  } catch (error: any) {
    console.error("❌ Agent Presence Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST Update Agent Presence
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agent_id, agent_name, lat, lng, is_online } = body;

    if (!agent_id) {
      return NextResponse.json({ error: "Missing Agent Identity" }, { status: 400 });
    }

    const order_id = `LIVE_AGENT_${agent_id}`;

    if (!is_online) {
      // Mark as offline
      await supabase
        .from('fleet_tracking')
        .update({ status: 'OFFLINE', last_updated: new Date().toISOString() })
        .eq('order_id', order_id);
      return NextResponse.json({ success: true, status: 'OFFLINE' });
    }

    // Upsert live location
    const { error: upsertError } = await supabase
      .from('fleet_tracking')
      .upsert({
        order_id,
        agent_id: agent_id.toString(),
        agent_name: agent_name || `Agent ${agent_id}`,
        current_lat: lat || 11.6234,
        current_lng: lng || 92.9468, // Default to Port Blair center if no GPS
        status: 'LIVE',
        last_updated: new Date().toISOString()
      }, { onConflict: 'order_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, status: 'LIVE' });
  } catch (error: any) {
    console.error("❌ Agent Presence Update Error:", error);
    return NextResponse.json({ error: "Presence Update Failed" }, { status: 500 });
  }
}
