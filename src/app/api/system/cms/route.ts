import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getSupabase() {
  return supabase;
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "success", content: [] });

    const { data, error } = await supabase.from('cms_content').select('*').order('id', { ascending: false });

    if (error) {
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
    const { id, title, type, status, sector, image_url, metadata } = body;

    const payload = {
      title,
      type,
      status,
      sector,
      image_url,
      metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
      updated_at: new Date().toISOString()
    };

    if (id) {
      const { error } = await supabase.from('cms_content').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('cms_content').insert(payload);
      if (error) throw error;
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

    const { error } = await supabase.from('cms_content').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
