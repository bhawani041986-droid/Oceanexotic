import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_FLEET = [
  { name: "Red Snapper", image: "/ICONS/Red-snapper.webp", swimRight: 1, swimLeft: -1 },
  { name: "Kingfish", image: "/ICONS/kingfish.webp", swimRight: 1, swimLeft: -1 },
  { name: "White Pomfret", image: "/ICONS/white-pomfret.webp", swimRight: 1, swimLeft: -1 },
  { name: "Grouper", image: "/ICONS/grouper.webp", swimRight: 1, swimLeft: -1 },
  { name: "Mackerel", image: "/ICONS/mackerel.webp", swimRight: 1, swimLeft: -1 }
];

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('marketplace_settings')
      .select('setting_value')
      .eq('setting_key', 'AQUARIUM_FISH_FLEET')
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_FLEET);
    }

    const fleet = JSON.parse(data.setting_value);
    if (!Array.isArray(fleet)) {
      return NextResponse.json(DEFAULT_FLEET);
    }
    return NextResponse.json(fleet);
  } catch (error) {
    console.error("GET aquarium-fish error:", error);
    return NextResponse.json(DEFAULT_FLEET);
  }
}

export async function POST(req: NextRequest) {
  try {
    const newFleet = await req.json();
    
    if (!Array.isArray(newFleet)) {
      return NextResponse.json({ error: "Invalid payload: must be an array" }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('marketplace_settings')
      .upsert({
        setting_key: 'AQUARIUM_FISH_FLEET',
        setting_value: JSON.stringify(newFleet),
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST aquarium-fish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
