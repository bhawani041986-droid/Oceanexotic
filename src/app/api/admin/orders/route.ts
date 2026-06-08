import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- FETCH GLOBAL TRADE LEDGER OR SPECIFIC ORDER ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!order) return NextResponse.json({ error: "Trade Order Not Found" }, { status: 404 });
      return NextResponse.json(order);
    }

    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(orders || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- COMMISSION NEW ORDER ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, customer_name, customer_phone, customer_address, seller_name, total_amount, status, logistics_status } = body;

    if (!id || !customer_name || !total_amount) {
      return NextResponse.json({ error: "Missing Trade Identity Nodes" }, { status: 400 });
    }

    const { error } = await supabase.from('orders').insert([{
      id,
      customer_name,
      customer_phone: customer_phone || '',
      customer_address: customer_address || '',
      seller_name: seller_name || 'Global Seafoods',
      total_amount,
      status: status || 'PENDING',
      logistics_status: logistics_status || 'OPTIMAL'
    }]);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Trade Order Commissioned in Sovereign Spine" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- UPDATE TRADE STATUS ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, customer_name, total_amount, status, logistics_status } = body;

    if (!id) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

    const { error } = await supabase.from('orders').update({
      customer_name,
      total_amount,
      status,
      logistics_status
    }).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Trade Status Synchronized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
