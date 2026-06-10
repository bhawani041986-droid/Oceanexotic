import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message_id, sender_id } = data;

    if (!message_id || !sender_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delete message where id and sender_id matches to prevent unauthorized deletion
    const { error: deleteError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', message_id)
      .eq('sender_id', sender_id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("Delete message API error:", error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
