import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to fetch from DB first
    const { data, error } = await supabase
      .from('delivery_slots_config')
      .select('slot_key, slot_label, slot_time, is_active, max_orders, cutoff_time')
      .order('sort_order');

    if (error || !data || data.length === 0) {
      // Fallback hardcoded slots
      return NextResponse.json([
        { slot_key: 'TODAY_AM', slot_label: 'Today Morning', slot_time: '10:00 AM – 12:00 PM', is_active: true, max_orders: 30, cutoff_time: '09:00' },
        { slot_key: 'TODAY_PM', slot_label: 'Today Evening', slot_time: '4:00 PM – 7:00 PM',   is_active: true, max_orders: 30, cutoff_time: '14:00' },
        { slot_key: 'TOMORROW', slot_label: 'Tomorrow',      slot_time: 'Next day delivery',    is_active: true, max_orders: 50, cutoff_time: '21:00' },
      ]);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Delivery slots fetch error:', err);
    return NextResponse.json([
      { slot_key: 'TODAY_AM', slot_label: 'Today Morning', slot_time: '10:00 AM – 12:00 PM', is_active: true, max_orders: 30, cutoff_time: '09:00' },
      { slot_key: 'TODAY_PM', slot_label: 'Today Evening', slot_time: '4:00 PM – 7:00 PM',   is_active: true, max_orders: 30, cutoff_time: '14:00' },
      { slot_key: 'TOMORROW', slot_label: 'Tomorrow',      slot_time: 'Next day delivery',    is_active: true, max_orders: 50, cutoff_time: '21:00' },
    ]);
  }
}

export async function PATCH(request: Request) {
  // Admin can toggle slots on/off and update capacity
  try {
    const body = await request.json();
    const { slot_key, is_active, max_orders } = body;

    if (!slot_key) {
      return NextResponse.json({ status: 'error', message: 'slot_key required' }, { status: 400 });
    }

    const updates: any = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (typeof max_orders === 'number') updates.max_orders = max_orders;

    const { data, error } = await supabase
      .from('delivery_slots_config')
      .update(updates)
      .eq('slot_key', slot_key)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
