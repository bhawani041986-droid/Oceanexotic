import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- FETCH PAYMENT REGISTRY ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    const { data: payments, error } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
      
    if (error) throw error;
    return NextResponse.json(payments || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- ADD PAYMENT SIGNATURE ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, type, card_holder, card_type, last4, expiry, upi_id, is_default } = body;

    if (!user_id) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    if (is_default) {
      await supabase.from('user_payments').update({ is_default: false }).eq('user_id', user_id);
    }

    const { error } = await supabase.from('user_payments').insert([{
      user_id,
      type: type || 'CARD',
      card_holder,
      card_type: card_type || 'VISA',
      last4: last4 || '',
      expiry: expiry || '',
      upi_id: upi_id || '',
      is_default: is_default || false
    }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Payment Signature Commissioned" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- TERMINATE PAYMENT PROTOCOL ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Protocol ID" }, { status: 400 });

    const { error } = await supabase.from('user_payments').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Payment Signature Purged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
