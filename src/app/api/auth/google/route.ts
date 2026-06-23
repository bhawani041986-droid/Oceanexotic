import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = body.idToken || '';
    const role = (body.role || 'CUSTOMER').toLowerCase();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'Missing Google ID Token' },
        { status: 400 }
      );
    }

    // Decode JWT payload (middle segment)
    const tokenParts = idToken.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid Google ID Token format' },
        { status: 400 }
      );
    }

    // Replace base64url characters with standard base64 characters
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, message: 'Failed to parse Google user information' },
        { status: 400 }
      );
    }

    const email = payload.email;
    const name = payload.name || 'Google User';

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw fetchError;
    }

    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray, dec => dec.toString(16).padStart(2, '0')).join('');

    if (user) {
      // User exists, log them in
      if (user.status === 'PENDING' || user.status === 'INACTIVE') {
        return NextResponse.json(
          { success: false, message: `Access Denied: Account status is ${user.status.toLowerCase()}` },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // User doesn't exist, create account
      const uniqueId = Date.now();
      const status = (role === 'agent') ? 'PENDING' : 'ACTIVE';
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(randomPassword, salt);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: uniqueId,
            name,
            email,
            password: hashedPassword,
            role: role,
            status: status
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        token: token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (error: any) {
    console.error("Auth google API error:", error);
    return NextResponse.json(
      { success: false, message: 'Registry handshake failure: ' + error.message },
      { status: 500 }
    );
  }
}
