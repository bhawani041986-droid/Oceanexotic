import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time in ISO format
    const now = new Date().toISOString();

    // Update all FRESH catches where expires_at has passed
    const { data, error } = await supabase
      .from('todays_catch')
      .update({ status: 'EXPIRED' })
      .eq('status', 'FRESH')
      .lt('expires_at', now)
      .select('id');

    if (error) {
      console.error("Cleanup Error:", error);
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      status: "success", 
      message: `Cleaned up ${data?.length || 0} expired catches.` 
    });
  } catch (error: any) {
    console.error("Cron Execution Failed:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
