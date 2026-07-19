import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- GET ALL LOYALTY TIERS ---
export async function GET() {
  try {
    const { data: tiers, error } = await supabase
      .from('loyalty_tier_config')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ status: "success", tiers });
  } catch (error: any) {
    console.error("Loyalty API GET Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

// --- UPDATE LOYALTY TIERS ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { tiers } = body;

    if (!tiers || !Array.isArray(tiers)) {
      return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
    }

    for (const tier of tiers) {
      const { error } = await supabase
        .from('loyalty_tier_config')
        .update({
          min_spend: Number(tier.min_spend),
          cashback_pct: Number(tier.cashback_pct),
          perks: tier.perks,
          icon_emoji: tier.icon_emoji
        })
        .eq('tier_key', tier.tier_key);

      if (error) throw error;
    }

    return NextResponse.json({ status: "success", message: "Loyalty tiers successfully updated." });
  } catch (error: any) {
    console.error("Loyalty API PUT Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
