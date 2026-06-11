import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "error", message: "Supabase configuration missing" }, { status: 500 });

    const { data, error } = await supabase
      .from('system_broadcasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
         // Table doesn't exist yet, return empty array so UI doesn't crash before SQL is run
         return NextResponse.json({ status: "success", content: [] });
      }
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
    const { title, content, type, channel } = body;

    if (!title || !content) {
      return NextResponse.json({ status: "error", message: "Title and content are required." }, { status: 400 });
    }

    const id = `SIG-${Math.floor(100 + Math.random() * 900)}`;

    const { error } = await supabase.from('system_broadcasts').insert([{
      id,
      title,
      content,
      type: type || 'SYSTEM',
      channel: channel || 'GLOBAL',
      status: 'SENT'
    }]);

    if (error) throw error;

    return NextResponse.json({ status: "success", id });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "error", message: "Supabase configuration missing" }, { status: 500 });

    const body = await req.json();
    const { id, title, content, type, channel } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ status: "error", message: "Missing required fields." }, { status: 400 });
    }

    const { error } = await supabase
      .from('system_broadcasts')
      .update({ title, content, type, channel })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ status: "error", message: "Supabase configuration missing" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ status: "error", message: "Missing signal ID." }, { status: 400 });
    }

    const { error } = await supabase.from('system_broadcasts').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
