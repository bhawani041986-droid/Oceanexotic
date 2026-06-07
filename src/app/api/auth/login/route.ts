import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || '';
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Retrieve user by email
    const user = await queryOne("SELECT * FROM users WHERE email = ?", [email]);

    if (user && user.password) {
      // Compare password hash (supports bcrypt $2y$ hashes from PHP)
      const isValid = bcrypt.compareSync(password, user.password);

      if (isValid) {
        // Verify user status
        if (user.status === 'PENDING') {
          return NextResponse.json(
            { success: false, message: 'Access Denied: Agent account is pending administrative approval.' },
            { status: 403 }
          );
        }
        if (user.status === 'INACTIVE') {
          return NextResponse.json(
            { success: false, message: 'Access Denied: Account has been suspended.' },
            { status: 403 }
          );
        }

        // Generate a random session token
        // Using standard cryptographically secure random values
        const tokenArray = new Uint8Array(32);
        crypto.getRandomValues(tokenArray);
        const token = Array.from(tokenArray, dec => dec.toString(16).padStart(2, '0')).join('');

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
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials in maritime registry' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error("Auth login API error:", error);
    return NextResponse.json(
      { success: false, message: 'Registry handshake failure: ' + error.message },
      { status: 500 }
    );
  }
}
