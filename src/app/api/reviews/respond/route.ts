import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { id, response } = await req.json();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    const { error } = await supabase
      .from('reviews')
      .update({ seller_response: response, responded_at: new Date().toISOString() })
      .eq('id', id);
      
    if (error) throw error;
    return NextResponse.json({ status: 'success', message: 'Response successfully recorded.' });
  } catch (error: any) {
    console.error("Reviews API Respond Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
