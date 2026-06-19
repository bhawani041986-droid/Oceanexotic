import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, message: "Backend is fully live on Vercel and synced with GitHub." });
}
