import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json({ error: "Missing order identity" }, { status: 400 });
    }

    // Fetch logs ordered by created_at ascending
    const { data: logs, error } = await supabase
      .from('fleet_logs')
      .select('*')
      .eq('order_id', order_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ logs: logs || [] });
  } catch (error: any) {
    console.error("❌ Agent Logs API Error:", error);
    return NextResponse.json({ error: "Logs Corrupted" }, { status: 500 });
  }
}
