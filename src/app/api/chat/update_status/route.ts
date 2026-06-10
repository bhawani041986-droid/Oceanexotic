import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { conversation_id, status } = data;

    if (!conversation_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('chat_conversations')
      .update({ status })
      .eq('id', conversation_id);

    if (updateError) throw updateError;

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("Update status API error:", error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
