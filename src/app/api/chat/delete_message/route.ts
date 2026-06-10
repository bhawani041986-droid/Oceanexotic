import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message_id, message_ids, sender_id } = data;

    if ((!message_id && (!message_ids || message_ids.length === 0)) || !sender_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (message_ids && Array.isArray(message_ids)) {
      // Bulk delete
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .in('id', message_ids)
        .eq('sender_id', sender_id);
      
      if (deleteError) throw deleteError;
    } else {
      // Single delete
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', message_id)
        .eq('sender_id', sender_id);
        
      if (deleteError) throw deleteError;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("Delete message API error:", error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
