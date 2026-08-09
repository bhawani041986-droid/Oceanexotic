import { NextResponse } from 'next/server';

export async function GET() {
  const envKeys = Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('SUPABASE') || key.includes('URL') || key.includes('KEY')
  );
  return NextResponse.json({ success: true, envKeys });
}
