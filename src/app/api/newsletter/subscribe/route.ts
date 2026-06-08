import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Insert subscriber
    const { error } = await supabase.from('subscribers').insert([{ email }]);
    if (error) {
      if (error.code === '23505') { // Postgres unique violation
        return NextResponse.json({ success: true, message: 'Already subscribed' });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Newsletter Subscription Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
