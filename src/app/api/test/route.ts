import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const start = Date.now();
    // Test the REST API connection by fetching 1 user
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase REST Connection Successful!',
      ping: Date.now() - start + 'ms',
      data
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed via REST',
      errorName: error.name || error.code,
      errorMessage: error.message,
      errorStack: error.details || error.hint || error.stack
    }, { status: 500 });
  }
}

