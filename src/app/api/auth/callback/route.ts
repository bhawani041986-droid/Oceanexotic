import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // We need the ANON key here to exchange the code via OAuth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyqmhibffbwoqlpdplfu.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cW1oaWJmZmJ3b3FscGRwbGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5Njg3NCwiZXhwIjoyMDk2MTcyODc0fQ.kEpSJdXULNm_9lzXE6UvqIXPc2L-UB38BFwVhR9OcPs';
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { session }, error } = await supabaseAuth.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth Exchange Error:", error.message);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=OAuthFailed`);
    }

    if (session && session.user && session.user.email) {
      const email = session.user.email;
      const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];

      // Check if user exists in the public users table
      let { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      let isNewUser = false;

      if (!dbUser) {
        // Create new user in public schema
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email: email,
            name: name,
            role: 'customer',
            status: 'ACTIVE',
            // Assign a random high-entropy dummy password since they use Google
            password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          })
          .select()
          .single();

        if (insertError) {
          console.error("Failed to create OAuth user:", insertError);
          return NextResponse.redirect(`${requestUrl.origin}/login?error=AccountCreationFailed`);
        }
        
        dbUser = newUser;
        isNewUser = true;
      } else if (dbUser.status === 'INACTIVE' || dbUser.status === 'PENDING') {
         return NextResponse.redirect(`${requestUrl.origin}/login?error=AccountSuspended`);
      }

      // Generate the custom maritime token
      const tokenArray = new Uint8Array(32);
      crypto.getRandomValues(tokenArray);
      const token = Array.from(tokenArray, dec => dec.toString(16).padStart(2, '0')).join('');

      const platform = requestUrl.searchParams.get('platform');
      if (platform === 'mobile') {
        const redirectUri = requestUrl.searchParams.get('redirect_uri') || 'oceanexotic://oauth-callback';
        const userObj = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role.toLowerCase()
        };
        const mobileRedirectUrl = `${redirectUri}?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`;
        return NextResponse.redirect(mobileRedirectUrl);
      }

      // Create a response that redirects
      let redirectUrl = `${requestUrl.origin}/customer/products`;
      if (dbUser.role === 'admin') redirectUrl = `${requestUrl.origin}/admin/dashboard`;
      if (dbUser.role === 'seller') redirectUrl = `${requestUrl.origin}/seller/dashboard`;
      if (isNewUser) redirectUrl = `${requestUrl.origin}/oauth-onboarding`;

      const response = NextResponse.redirect(redirectUrl);

      // Pass token and user details to frontend via cookies so the client-side store can hydrate
      response.cookies.set('oauth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set('oauth_user', JSON.stringify({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role.toLowerCase()
      }), { path: '/', maxAge: 60 * 60 * 24 * 7 });

      return response;
    }
  }

  // Fallback error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=NoCode`);
}
