import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Do not return the hashed password to the client
    delete user.password;

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
