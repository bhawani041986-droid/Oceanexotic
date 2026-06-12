import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json();

    if (!userId || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required profile parameters.' },
        { status: 400 }
      );
    }

    // Update the registry
    const { error } = await supabase
      .from('users')
      .update({ name: name, email: email })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Authority identity successfully synchronized across the network.' 
    });

  } catch (error: any) {
    console.error("Update Profile API error:", error);
    return NextResponse.json(
      { success: false, message: 'Identity synchronization failed: ' + error.message },
      { status: 500 }
    );
  }
}
