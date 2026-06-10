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

    // Robust graceful fallback: If any column is missing in the DB schema, strip it and retry.
    let retryCount = 0;
    while (error && error.message && error.message.includes('column') && retryCount < 5) {
      const match = error.message.match(/'([^']+)' column/) || error.message.match(/column "([^"]+)"/);
      if (match && match[1]) {
        const missingColumn = match[1];
        delete updates[missingColumn];
        console.warn(`Stripped missing column from update payload: ${missingColumn}`);
        const retry = await supabase.from('users').update(updates).eq('id', id);
        error = retry.error;
        retryCount++;
      } else {
        break;
      }
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
