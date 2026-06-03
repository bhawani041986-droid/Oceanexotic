import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// --- FETCH ADDRESS VAULT ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    // Ensure we handle both numeric and string IDs gracefully
    const sql = "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC";
    const addresses = await query(sql, [userId]);
    
    // Map the returned rows to what the client expects (type and address)
    const formattedAddresses = (Array.isArray(addresses.data) ? addresses.data : []).map((addr: any) => ({
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
      await query("UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?", [user_id], 'UPDATE');
    }

    await query(
      "INSERT INTO user_addresses (user_id, label, hotel_name, room_no, jetty, address_line1, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id, 
        type || 'HOME', 
        hotel_name || '', 
        room_no || '', 
        jetty || '', 
        address, 
        phone || '', 
        is_default || false
      ],
      'INSERT'
    );

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

    await query("DELETE FROM user_addresses WHERE id = ?", [id], 'DELETE');

    return NextResponse.json({ success: true, message: "Coordinate Node Purged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
