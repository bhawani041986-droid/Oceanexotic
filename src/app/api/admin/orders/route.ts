import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// --- FETCH GLOBAL TRADE LEDGER OR SPECIFIC ORDER ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);
      if (!order) return NextResponse.json({ error: "Trade Order Not Found" }, { status: 404 });
      return NextResponse.json(order);
    }

    const orders = await query("SELECT * FROM orders ORDER BY created_at DESC");
    return NextResponse.json(orders.data);
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

    await query(
      "INSERT INTO orders (id, customer_name, customer_phone, customer_address, seller_name, total_amount, status, logistics_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, customer_name, customer_phone || '', customer_address || '', seller_name || 'Global Seafoods', total_amount, status || 'PENDING', logistics_status || 'OPTIMAL'],
      'INSERT'
    );

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

    await query(
      "UPDATE orders SET customer_name = ?, total_amount = ?, status = ?, logistics_status = ? WHERE id = ?",
      [customer_name, total_amount, status, logistics_status, id],
      'UPDATE'
    );

    return NextResponse.json({ success: true, message: "Trade Status Synchronized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
