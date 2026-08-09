import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "To update the database, please copy the migration SQL from payment_system_plan.md and execute it inside the Supabase Dashboard SQL Editor."
  });
}
