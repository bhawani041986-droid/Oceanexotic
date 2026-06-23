import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data || !data.name || !data.zone_type) {
      return NextResponse.json({ status: 'error', message: 'Territory manifest incomplete.' }, { status: 400 });
    }

    const insertPayload: any = {
      name: data.name,
      zone_type: data.zone_type,
      parent_id: data.parent_id || null,
      status: data.status || 'ACTIVE'
    };

    if (data.coordinates !== undefined) {
      insertPayload.coordinates = data.coordinates;
    }

    const { error } = await supabase
      .from('maritime_territories')
      .insert([insertPayload]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: 'success', message: 'Maritime Node Commissioned.' });
  } catch (error: any) {
    console.error('Add Territory API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
