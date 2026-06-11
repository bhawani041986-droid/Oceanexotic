import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "error", message: "Supabase configuration missing" }, { status: 500 });

    const body = await req.json();
    const { code, cartTotal } = body;

    if (!code) {
      return NextResponse.json({ status: "error", message: "Missing coupon code." }, { status: 400 });
    }

    const upperCode = code.toUpperCase();

    const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', upperCode).single();

    if (error || !coupon) {
      return NextResponse.json({ status: "error", message: "Invalid or unrecognized code." }, { status: 404 });
    }

    // Validation Checks
    if (coupon.status !== 'ACTIVE') {
      return NextResponse.json({ status: "error", message: "This code is no longer active." }, { status: 400 });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ status: "error", message: "This code has expired." }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ status: "error", message: "This code has reached its usage limit." }, { status: 400 });
    }

    if (cartTotal < (coupon.min_purchase || 0)) {
      return NextResponse.json({ 
        status: "error", 
        message: `Minimum order value of ₹${coupon.min_purchase} required.` 
      }, { status: 400 });
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = cartTotal * (coupon.value / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.value;
    }

    // Ensure we don't discount more than the cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return NextResponse.json({ 
      status: "success", 
      discountAmount,
      couponType: coupon.type,
      couponValue: coupon.value
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
