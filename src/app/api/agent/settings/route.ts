import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- FETCH AGENT SETTINGS ---
export async function GET() {
  try {
    const agentId = 7; // In production, get from session (Matches frontend userId=7)
    const { data: settings, error } = await supabase
      .from('agent_settings')
      .select('current_mood')
      .eq('agent_id', agentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
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
    const agentId = 7;

    if (!mood) return NextResponse.json({ error: "Missing Mood Node" }, { status: 400 });

    const { error } = await supabase
      .from('agent_settings')
      .upsert({ agent_id: agentId, current_mood: mood }, { onConflict: 'agent_id' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Tactical Environment Anchored" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
