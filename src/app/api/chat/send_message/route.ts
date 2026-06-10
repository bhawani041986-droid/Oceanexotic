import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { conversation_id, sender_id, message_text } = data;

    if (!conversation_id || !sender_id || !message_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert message
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id,
          sender_id,
          message_text,
          is_read: 0
        }
      ]);

    if (insertError) throw insertError;

    // Update conversation last_message
    const { error: updateError } = await supabase
      .from('chat_conversations')
      .update({
        last_message_text: message_text,
        last_message_time: new Date().toISOString()
      })
      .eq('id', conversation_id);

    if (updateError) throw updateError;

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("Send message API error:", error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
