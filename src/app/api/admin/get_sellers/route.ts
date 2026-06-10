import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: sellers, error } = await supabase
      .from('users')
      .select('id, name, email, status, created_at')
      .eq('role', 'seller')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedSellers = sellers.map(seller => {
      // Create mock telemetry data for the UI
      return {
        id: String(seller.id),
        name: seller.name,
        lead: seller.name, // using name as lead since we don't have a lead field
        email: seller.email,
        status: seller.status,
        rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1), // Random rating between 4.5 and 5.0
        products: Math.floor(Math.random() * 50) + 5,
        health: seller.status === 'VERIFIED' || seller.status === 'ACTIVE' ? 'OPTIMAL' : seller.status === 'PENDING' ? 'PENDING' : 'CRITICAL',
        revenue: `₹${(Math.random() * 90 + 10).toFixed(1)}K`, // Random revenue between 10K and 100K
        commission: `${Math.floor(Math.random() * 10) + 5}%` // Random commission between 5% and 15%
      };
    });

    return NextResponse.json(formattedSellers);
  } catch (error: any) {
    console.error("Fetch sellers API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Failed to sync merchant registry: ' + error.message },
      { status: 500 }
    );
  }
}
