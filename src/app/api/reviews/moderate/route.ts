import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    if (action === 'delete') {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ status: 'success', message: 'Review successfully deleted.' });
    } else {
      const statusMap: Record<string, string> = { approve: 'APPROVED', reject: 'REJECTED', flag: 'FLAGGED' };
      const status = statusMap[action.toLowerCase()] || action.toUpperCase();
      
      const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ status: 'success', message: `Review marked as ${status}.` });
    }
  } catch (error: any) {
    console.error("Reviews API Moderate Error:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
