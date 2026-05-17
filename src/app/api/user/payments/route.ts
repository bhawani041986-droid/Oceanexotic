import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// --- FETCH PAYMENT REGISTRY ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    const payments = await query("SELECT * FROM user_payments WHERE user_id = ? ORDER BY is_default DESC", [userId]);
    return NextResponse.json(payments.data);
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
      await query("UPDATE user_payments SET is_default = FALSE WHERE user_id = ?", [user_id], 'UPDATE');
    }

    await query(
      "INSERT INTO user_payments (user_id, type, card_holder, card_type, last4, expiry, upi_id, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, type || 'CARD', card_holder, card_type || 'VISA', last4 || '', expiry || '', upi_id || '', is_default || false],
      'INSERT'
    );

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

    await query("DELETE FROM user_payments WHERE id = ?", [id], 'DELETE');

    return NextResponse.json({ success: true, message: "Payment Signature Purged" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
