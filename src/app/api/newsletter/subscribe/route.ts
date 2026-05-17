import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if table exists and create if not
    await query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], 'UPDATE');

    // Insert subscriber
    await query('INSERT INTO subscribers (email) VALUES (?)', [email], 'INSERT');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('Duplicate entry')) {
        return NextResponse.json({ success: true, message: 'Already subscribed' });
    }
    console.error("Newsletter Subscription Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
