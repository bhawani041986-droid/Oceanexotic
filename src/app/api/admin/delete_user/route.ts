import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { status: "error", message: 'Missing user id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "success"
    });
  } catch (error: any) {
    console.error("Delete user API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to delete node: ' + error.message },
      { status: 500 }
    );
  }
}
