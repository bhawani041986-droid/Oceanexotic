import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: subscribers, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(subscribers || []);
  } catch (error: any) {
    console.error("Subscriber Registry Retrieval Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'ID and Status required' }, { status: 400 });

    const newStatus = status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const { error } = await supabase.from('subscribers').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
