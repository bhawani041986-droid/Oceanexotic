import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { translateArray } from '@/lib/translate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const targetLang = request.headers.get('Accept-Language');

    let query = supabase
      .from('addons')
      .select('*')
      .eq('is_active', 1);

    // Optional: could filter by area if allowed_areas is used
    if (area) {
      // Basic filtering example if needed: query = query.ilike('allowed_areas', `%${area}%`);
    }

    const { data: addons, error } = await query;

    if (error) {
      throw error;
    }

    const translated = await translateArray(
      addons || [],
      ['name', 'type'],
      targetLang
    );

    return NextResponse.json(translated);
  } catch (error: any) {
    console.error("Addons List API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
