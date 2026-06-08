import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: territories, error } = await supabase
      .from('maritime_territories')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(territories || []);
  } catch (error: any) {
    console.error("Get Territories API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
