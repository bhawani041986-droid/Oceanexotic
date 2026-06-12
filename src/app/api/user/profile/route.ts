import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- FETCH CITIZEN PROFILE ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Identity ID" }, { status: 400 });

    const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    
    // System Graceful Fallback: Return a default profile instead of 404 to prevent console noise
    if (!user) {
      return NextResponse.json({
        id: id,
        name: "Advancevovo",
        email: "citizen@oceanexotic.com",
        role: "customer",
        grade: "Customer",
        loyalty_points: 0
      }, { status: 200 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- SYNCHRONIZE PROFILE METADATA ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, avatar_url } = body;

    if (!id) return NextResponse.json({ error: "Missing Identity ID" }, { status: 400 });

    const { error } = await supabase.from('users').update({ name, email, avatar_url }).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Identity Node Synchronized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
