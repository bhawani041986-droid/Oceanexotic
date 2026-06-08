import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ success: true, schema: [{ Field: 'Mocked for REST API', Type: 'string' }] });
}
