import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Node ID required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('maritime_territories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: 'success', message: 'Maritime Node Decommissioned.' });
  } catch (error: any) {
    console.error('Delete Territory API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
