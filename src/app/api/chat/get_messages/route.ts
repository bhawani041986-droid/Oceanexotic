import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const userId = searchParams.get('user_id');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Mark messages as read if userId is provided
    if (userId) {
      await supabase
        .from('chat_messages')
        .update({ is_read: 1 })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(messages || []);
  } catch (error: any) {
    console.error("Fetch messages API error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
