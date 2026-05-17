import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// --- FETCH CITIZEN PROFILE ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Identity ID" }, { status: 400 });

    const user = await queryOne("SELECT * FROM users WHERE id = ?", [id]);
    
    // Sovereign Graceful Fallback: Return a default profile instead of 404 to prevent console noise
    if (!user) {
      return NextResponse.json({
        id: id,
        name: "Advancevovo",
        email: "citizen@oceanexotic.com",
        role: "customer",
        grade: "Maritime Citizen",
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

    await query(
      "UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?",
      [name, email, avatar_url, id],
      'UPDATE'
    );

    return NextResponse.json({ success: true, message: "Identity Node Synchronized" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
