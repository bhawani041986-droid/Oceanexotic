import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- FETCH ADDRESS VAULT ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    // Ensure we handle both numeric and string IDs gracefully
    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
      
    if (error) throw error;
    
    // Map the returned rows to what the client expects (type and address)
    const formattedAddresses = (addresses || []).map((addr: any) => ({
      ...addr,
      type: addr.label,
      address: addr.address_line1
    }));
    
    return NextResponse.json(formattedAddresses);
  } catch (error: any) {
    console.error("Addresses API Error:", error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 200 }); // Return 200 with empty array to prevent 500 crashes
  }
}

// --- COMMISSION NEW ADDRESS NODE ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, type, hotel_name, room_no, jetty, address, phone, is_default } = body;

    if (!user_id || !address) return NextResponse.json({ error: "Missing Coordinate Nodes" }, { status: 400 });

    // If setting as default, unset others
    if (is_default) {
      await supabase.from('user_addresses').update({ is_default: 0 }).eq('user_id', user_id);
    }

    const { error } = await supabase.from('user_addresses').insert([{
      user_id,
      label: type || 'HOME',
      hotel_name: hotel_name || '',
      room_no: room_no || '',
      jetty: jetty || '',
      address_line1: address,
      phone: phone || '',
      is_default: is_default ? 1 : 0
    }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Coordinate Node Commissioned" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- DECOMMISSION ADDRESS ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Node ID" }, { status: 400 });

    const { error } = await supabase.from('user_addresses').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Coordinate Node Purged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
