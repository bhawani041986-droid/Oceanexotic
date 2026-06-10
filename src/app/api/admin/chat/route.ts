import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- PARTIAL UPDATE (PATCH) ---
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { conversation_id, status, priority, order_id } = body;

    if (!conversation_id) {
      return NextResponse.json({ status: "error", message: "Missing conversation_id" }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (order_id !== undefined) updates.order_id = order_id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ status: "error", message: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase.from('chat_conversations').update(updates).eq('id', conversation_id);
    if (error) throw error;

    return NextResponse.json({ status: "success", message: "Support Ticket Synchronized" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
