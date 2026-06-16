import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPhpServerUrl } from '@/config/api';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status, tracking_number')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Map to expected mobile app interface
      const mappedOrders = orders?.map((o) => ({
        id: String(o.id),
        date: new Date(o.created_at).toLocaleDateString(),
        total: Number(o.total_amount),
        status: o.status,
        items: 1, // Simplified since we don't join order_items here to save speed
        tracking: o.tracking_number,
      })) || [];

      return NextResponse.json(mappedOrders);
    }

    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/orders/customer_history.php?userId=${userId}`;
    
    const response = await fetch(phpApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`PHP API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Mobile Order History API Proxy Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
