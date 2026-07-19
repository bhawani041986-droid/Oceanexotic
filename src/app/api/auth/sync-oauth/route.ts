import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { access_token } = body;

    if (!access_token) {
      return NextResponse.json({ success: false, message: "Missing access token" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
    // Use the anon key (not service_role) to verify user tokens — respects RLS
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTY4NzQsImV4cCI6MjA5NjE3Mjg3NH0.hZ1WiT_8CX4O85mWVhtpFLrGxCGSSTPL1sS-Q6z5L9g';
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    // Get user details from the token
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(access_token);

    if (userError || !user || !user.email) {
      return NextResponse.json({ success: false, message: "Invalid OAuth token" }, { status: 401 });
    }

    const email = user.email;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    // Check if user exists in our public schema
    let { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let isNewUser = false;

    if (!dbUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: email,
          name: name,
          avatar: avatar,
          role: 'customer',
          status: 'ACTIVE',
          password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ success: false, message: "Failed to sync user account" }, { status: 500 });
      }
      dbUser = newUser;
      isNewUser = true;
    } else if (dbUser.status === 'INACTIVE' || dbUser.status === 'PENDING') {
      return NextResponse.json({ success: false, message: "Account Suspended" }, { status: 403 });
    } else if (avatar && !dbUser.avatar) {
      // Update existing user with avatar if they didn't have one
      const { data: updatedUser } = await supabase
        .from('users')
        .update({ avatar })
        .eq('id', dbUser.id)
        .select()
        .single();
      if (updatedUser) dbUser = updatedUser;
    }

    // Generate custom JWT/token for the app
    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const customToken = Array.from(tokenArray, dec => dec.toString(16).padStart(2, '0')).join('');

    let redirectUrl = '/customer/products';
    if (dbUser.role === 'admin') redirectUrl = '/admin/dashboard';
    if (dbUser.role === 'seller') redirectUrl = '/seller/dashboard';
    if (isNewUser) redirectUrl = '/oauth-onboarding';

    const response = NextResponse.json({
      success: true,
      token: customToken,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role.toLowerCase(),
        avatar: dbUser.avatar
      },
      redirectUrl
    });

    // Set cookies for server-side auth
    response.cookies.set('oauth_token', customToken, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('oauth_user', JSON.stringify({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role.toLowerCase(),
      avatar: dbUser.avatar
    }), { path: '/', maxAge: 60 * 60 * 24 * 7 });

    return response;
  } catch (error) {
    console.error("Sync OAuth Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
