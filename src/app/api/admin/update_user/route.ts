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
    
    if (data.avatar_url) {
       updates.avatar_url = data.avatar_url;
    }

    if (data.rank) {
       updates.rank = data.rank;
    }

    let { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    // Graceful fallback if rank column does not exist yet
    if (error && error.message && error.message.includes('rank') && error.message.includes('column')) {
      delete updates.rank;
      const fallback = await supabase.from('users').update(updates).eq('id', id);
      error = fallback.error;
    }

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
