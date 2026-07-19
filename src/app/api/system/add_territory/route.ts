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
      status: data.status || 'ACTIVE',
      delivery_charge: data.delivery_charge !== undefined ? data.delivery_charge : 0,
      minimum_order: data.minimum_order !== undefined ? data.minimum_order : 0,
      eta_mins: data.eta_mins !== undefined ? data.eta_mins : 30,
      hub_code: data.hub_code || null,
      manager_name: data.manager_name || null,
      rider_capacity: data.rider_capacity !== undefined ? data.rider_capacity : 0
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
