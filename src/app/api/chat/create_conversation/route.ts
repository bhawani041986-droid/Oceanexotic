import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { participant_1, participant_2 } = data;

    if (!participant_1 || !participant_2) {
      return NextResponse.json({ error: 'Participants are required' }, { status: 400 });
    }

    // Check if conversation already exists
    const { data: existing, error: existError } = await supabase
      .from('chat_conversations')
      .select('id')
      .or(`and(participant_1.eq.${participant_1},participant_2.eq.${participant_2}),and(participant_1.eq.${participant_2},participant_2.eq.${participant_1})`)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        status: 'success',
        message: 'Connection already exists.',
        conversation_id: existing.id
      });
    }

    // Attempt to fetch name of participant 2 to set as title
    let title = participant_2;
    const { data: user } = await supabase.from('users').select('name').eq('id', participant_2).single();
    if (user) {
      title = user.name;
    } else {
      const { data: admin } = await supabase.from('admins').select('name').eq('id', participant_2).single();
      if (admin) title = admin.name;
    }

    // Create new conversation
    const { data: newConv, error: insertError } = await supabase
      .from('chat_conversations')
      .insert([
        {
          title,
          participant_1,
          participant_2,
          status: 'OPEN',
          priority: 'NORMAL'
        }
      ])
      .select('id')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      status: 'success',
      message: 'Secure channel established.',
      conversation_id: newConv.id
    });
  } catch (error: any) {
    console.error("Create conversation API error:", error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
