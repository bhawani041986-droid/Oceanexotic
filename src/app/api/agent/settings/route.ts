import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// --- FETCH AGENT SETTINGS ---
export async function GET() {
  try {
    const agentId = "AGENT-007"; // In production, get from session
    const settings = await queryOne("SELECT current_mood FROM agent_settings WHERE agent_id = ?", [agentId]);
    
    if (!settings) {
      return NextResponse.json({ current_mood: "SENTINEL" });
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- UPDATE AGENT SETTINGS ---
export async function POST(request: Request) {
  try {
    const { mood } = await request.json();
    const agentId = "AGENT-007";

    if (!mood) return NextResponse.json({ error: "Missing Mood Node" }, { status: 400 });

    const existing = await queryOne("SELECT agent_id FROM agent_settings WHERE agent_id = ?", [agentId]);

    if (existing) {
      await query("UPDATE agent_settings SET current_mood = ? WHERE agent_id = ?", [mood, agentId], 'UPDATE');
    } else {
      await query("INSERT INTO agent_settings (agent_id, current_mood) VALUES (?, ?)", [agentId, mood], 'INSERT');
    }

    return NextResponse.json({ success: true, message: "Tactical Environment Anchored" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
