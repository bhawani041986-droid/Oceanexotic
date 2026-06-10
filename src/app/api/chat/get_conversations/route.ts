import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch conversations where user is participant_1 or participant_2
    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select(`
        id,
        title,
        participant_1,
        participant_2,
        last_message_text,
        last_message_time,
        status,
        priority
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_time', { ascending: false });

    if (error) {
      throw error;
    }

    // Format for the frontend
    const formatted = await Promise.all(conversations.map(async (conv) => {
      const otherPartyId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
      
      // Try to get other party name
      const { data: user } = await supabase.from('users').select('name, role').eq('id', otherPartyId).single();
      const { data: admin } = await supabase.from('admins').select('name').eq('id', otherPartyId).single();

      let otherName = conv.title || otherPartyId;
      let role = 'Node';
      if (user) {
        otherName = user.name;
        role = user.role;
      } else if (admin || otherPartyId === 'ADM-001') {
        otherName = admin ? admin.name : 'OceanExotic Admin';
        role = 'Admin';
      } else if (otherPartyId.startsWith('FLEET-')) {
        otherName = `Delivery Agent (${otherPartyId})`;
        role = 'Agent';
      }

      // Fetch unread count
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId)
        .eq('is_read', 0);

      const { data: lastMsg } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastTime = conv.last_message_time ? new Date(conv.last_message_time) : new Date();

      return {
        id: conv.id,
        other_party_id: otherPartyId,
        other_party_name: otherName,
        other_party_role: role,
        last_message: conv.last_message_text || "Secure channel opened.",
        last_message_sender_id: lastMsg?.sender_id || null,
        time: lastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: lastTime.getTime(),
        unread_count: count || 0,
        status: conv.status || 'OPEN',
        priority: conv.priority || 'NORMAL',
        online: true // Mock online status
      };
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Fetch conversations API error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
