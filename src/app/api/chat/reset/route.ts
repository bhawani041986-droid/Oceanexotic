import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("Clearing old chats...");
  
  await supabase.from('chat_messages').delete().neq('id', -1);
  await supabase.from('chat_conversations').delete().neq('id', -1);

  console.log("Inserting dummy chat for Admin (ADM-001) and Customer (USR-001)...");
  
  const { data, error } = await supabase.from('chat_conversations').insert([
    {
      title: "Support Ticket #1001",
      participant_1: "ADM-001",
      participant_2: "USR-001",
      last_message_text: "Hello! How can I help you today?",
      last_message_time: new Date().toISOString()
    }
  ]).select();

  const convId = data ? data[0].id : null;

  console.log("Inserting dummy chat for Admin (ADM-001) and Seller (Abhijeet / SEL-001)...");
  
  await supabase.from('chat_conversations').insert([
    {
      title: "Seller Support",
      participant_1: "ADM-001",
      participant_2: "SEL-001",
      last_message_text: "Hi Admin, I need help with my listing.",
      last_message_time: new Date().toISOString()
    }
  ]);

  if (convId) {
    await supabase.from('chat_messages').insert([
      {
        conversation_id: convId,
        sender_id: "ADM-001",
        message_text: "Hello! How can I help you today?",
        is_read: 1
      }
    ]);
  }

  return NextResponse.json({ success: true, message: "Reset complete" });
}
