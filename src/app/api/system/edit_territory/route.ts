import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data || !data.id || !data.name || !data.zone_type) {
      return NextResponse.json({ status: 'error', message: 'Territory manifest incomplete.' }, { status: 400 });
    }

    const updatePayload: any = {
      name: data.name,
      zone_type: data.zone_type,
      parent_id: data.parent_id || null,
    };

    if (data.coordinates !== undefined) {
      updatePayload.coordinates = data.coordinates;
    }

    const { error } = await supabase
      .from('maritime_territories')
      .update(updatePayload)
      .eq('id', data.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: 'success', message: 'Maritime Node Re-commissioned.' });
  } catch (error: any) {
    console.error('Edit Territory API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
