import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getSupabase() {
  return supabase;
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "success", content: [] });

    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, just return empty array
      if (error.code === '42P01') return NextResponse.json({ status: "success", content: [] });
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "success", content: data });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "error", message: "Supabase configuration missing" }, { status: 500 });

    const body = await req.json();
    const { id, code, type, value, min_purchase, max_discount, usage_limit, expiry_date, status } = body;

    const payload = {
      code: code.toUpperCase(),
      type,
      value: parseFloat(value) || 0,
      min_purchase: parseFloat(min_purchase) || 0,
      max_discount: parseFloat(max_discount) || 0,
      usage_limit: parseInt(usage_limit) || 1000,
      expiry_date: expiry_date || null,
      status: status || 'ACTIVE'
    };

    if (id) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      // Insert with a generated ID if needed
      const insertPayload = {
        ...payload,
        id: `CPN-${Math.floor(100000 + Math.random() * 900000)}`,
        usage_count: 0
      };
      const { error } = await supabase.from('coupons').insert(insertPayload);
      if (error) {
         if (error.code === '23505') {
            return NextResponse.json({ status: "error", message: "Coupon code already exists." }, { status: 400 });
         }
         throw error;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 });

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "error", message: "Supabase configuration missing" }, { status: 500 });

    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
