import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, name, email, role, status, password } = data;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updates: any = {
      name,
      email,
      role: role || 'CUSTOMER',
      status: status || 'ACTIVE',
      updated_at: new Date().toISOString()
    };

    if (password) {
       updates.password = password; // Warning: In production, hash this password before saving!
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
