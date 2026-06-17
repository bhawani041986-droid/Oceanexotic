import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Returns all agents (role = AGENT) for seller dropdown population
export async function GET() {
  try {
    const { data: agents, error } = await supabase
      .from('users')
      .select('id, name, phone, email')
      .eq('role', 'AGENT')
      .order('name', { ascending: true });

    if (error) throw error;

    const formatted = (agents || []).map(a => ({
      id: a.id,
      name: a.name || 'Agent',
      phone: a.phone || '',
      email: a.email || '',
      zone: 'Port Blair' // default zone — extend later with zone column
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
