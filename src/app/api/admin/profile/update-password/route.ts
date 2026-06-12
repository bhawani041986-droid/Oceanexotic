import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing core identity parameters or directive payload' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Directive key must contain at least 8 cryptographic symbols' },
        { status: 400 }
      );
    }

    // Generate secure hash utilizing bcrypt ($2y$ compatibility)
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update the registry
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Authority key successfully rotated and secured in the global registry.' 
    });

  } catch (error: any) {
    console.error("Update Password API error:", error);
    return NextResponse.json(
      { success: false, message: 'Cryptographic update failed: ' + error.message },
      { status: 500 }
    );
  }
}
