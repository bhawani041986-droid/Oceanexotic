import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- REFERRAL REDEMPTION ENGINE ---
export async function POST(request: Request) {
  try {
    const { referee_id, referral_code } = await request.json();

    if (!referee_id || !referral_code) {
      return NextResponse.json({ error: "Missing referee ID or referral code" }, { status: 400 });
    }

    // 1. Find the referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, wallet_balance')
      .eq('referral_code', referral_code)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    if (referrer.id === referee_id) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
    }

    // 2. Check if already referred
    const { data: existingRef } = await supabase
      .from('referral_transactions')
      .select('id')
      .eq('referee_id', referee_id)
      .single();

    if (existingRef) {
      return NextResponse.json({ error: "You have already used a referral code" }, { status: 400 });
    }

    // 3. Create the referral transaction
    const { error: insertError } = await supabase
      .from('referral_transactions')
      .insert([
        { 
          referrer_id: referrer.id, 
          referee_id: referee_id,
          status: 'CREDITED',
          referrer_credit: 100,
          referee_credit: 100,
          credited_at: new Date().toISOString()
        }
      ]);

    if (insertError) throw insertError;

    // 4. Update Referrer Wallet
    await supabase
      .from('users')
      .update({ wallet_balance: Number(referrer.wallet_balance || 0) + 100 })
      .eq('id', referrer.id);

    // 5. Update Referee Wallet & Mark referred_by
    const { data: referee } = await supabase.from('users').select('wallet_balance').eq('id', referee_id).single();
    await supabase
      .from('users')
      .update({ 
        wallet_balance: Number(referee?.wallet_balance || 0) + 100,
        referred_by: referrer.id
      })
      .eq('id', referee_id);

    // 6. Log Wallet Transactions
    await supabase.from('wallet_transactions').insert([
      { user_id: referrer.id, type: 'REFERRAL_REWARD', amount: 100, balance_after: Number(referrer.wallet_balance || 0) + 100, description: `Referral reward for inviting user ${referee_id}` },
      { user_id: referee_id, type: 'REFERRAL_REWARD', amount: 100, balance_after: Number(referee?.wallet_balance || 0) + 100, description: `Welcome bonus via referral code ${referral_code}` }
    ]);

    return NextResponse.json({ success: true, message: "Referral applied successfully. ₹100 credited to wallet." });

  } catch (error: any) {
    console.error("Referral API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
