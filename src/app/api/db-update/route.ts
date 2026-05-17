import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
      const res = await query("DESCRIBE user_addresses");
      return NextResponse.json({ success: true, schema: res.data });
  } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message });
  }
}
