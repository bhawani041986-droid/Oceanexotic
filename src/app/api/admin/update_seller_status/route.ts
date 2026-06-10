import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { status: "error", message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "success",
      db_status: status
    });
  } catch (error: any) {
    console.error("Update seller status API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to update merchant status: ' + error.message },
      { status: 500 }
    );
  }
}
