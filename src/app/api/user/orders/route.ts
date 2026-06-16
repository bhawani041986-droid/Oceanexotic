import { NextResponse } from 'next/server';
import { getPhpServerUrl } from '@/config/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Missing Citizen ID" }, { status: 400 });

    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/orders/customer_history.php?userId=${userId}`;
    
    const response = await fetch(phpApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Using no-store to ensure live data (similar to Supabase)
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`PHP API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("User Orders API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
