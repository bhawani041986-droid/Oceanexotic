import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPhpServerUrl } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (process.env.NODE_ENV === 'production') {
      const { data, error } = await supabase
        .from('reviews')
        .insert([body])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/reviews/create.php`;
    
    const response = await fetch(phpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create review' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Create Review API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
