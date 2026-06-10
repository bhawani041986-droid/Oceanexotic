import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: "error", message: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: 'A fleet node with this email is already commissioned.' },
        { status: 409 }
      );
    }

    // Hash the password securely
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Default status: Sellers might require approval, but let's default to ACTIVE for immediate entry unless otherwise specified
    const newStatus = 'ACTIVE';

    const uniqueId = Date.now();

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          id: uniqueId,
          name,
          email,
          password: hashedPassword,
          role: role || 'customer',
          status: newStatus
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "success",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error: any) {
    console.error("Auth register API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Fleet registry failure: ' + error.message },
      { status: 500 }
    );
  }
}
