import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Node ID required.' }, { status: 400 });
    }

    // First fetch current status
    const { data: territory, error: fetchError } = await supabase
      .from('maritime_territories')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newStatus = territory.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { error: updateError } = await supabase
      .from('maritime_territories')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ status: 'success', message: `Maritime Node status updated to ${newStatus}.` });
  } catch (error: any) {
    console.error('Toggle Territory Status API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
