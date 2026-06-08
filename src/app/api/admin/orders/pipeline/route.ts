import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getDeliveryArea(address: string): string {
  const addr = (address || '').toLowerCase();
  if (addr.includes('havelock') || addr.includes('swaraj dweep')) return 'Havelock Island';
  if (addr.includes('neil island') || addr.includes('shaheed dweep')) return 'Neil Island';
  if (addr.includes('bambooflat') || addr.includes('bamboo flat')) return 'Bambooflat';
  if (addr.includes('garacharma')) return 'Garacharma';
  if (addr.includes('diglipur')) return 'Diglipur';
  if (addr.includes('rangat')) return 'Rangat';
  if (addr.includes('mayabundar')) return 'Mayabundar';
  if (addr.includes('baratang')) return 'Baratang';
  if (addr.includes('haddo')) return 'Haddo';
  if (addr.includes('phoenix bay')) return 'Phoenix Bay';
  if (addr.includes('aberdeen')) return 'Aberdeen Bazaar';
  return 'Port Blair';
}

// GET /api/admin/orders/pipeline
// Returns aggregated order statistics grouped by area and by seller
export async function GET() {
  try {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map data to match old query format
    const orders = (ordersData || []).map((o: any) => ({
      ...o,
      customer_name: o.users?.name || o.customer_name,
      seller_name: o.seller_name // Assuming seller_name is stored or defaults
    }));

    // --- Group by area ---
    const areaMap: Record<string, {
      area: string;
      orderCount: number;
      revenue: number;
      pending: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    }> = {};

    // --- Group by seller ---
    const sellerMap: Record<string, {
      seller_name: string;
      orderCount: number;
      revenue: number;
      pending: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    }> = {};

    orders.forEach((o: any) => {
      const addr = o.delivery_address || o.customer_address || '';
      const area = o.delivery_area || getDeliveryArea(addr);
      const seller = o.seller_name || 'Andaman Fleet';
      const amount = Number(o.total_amount) || 0;

      // Area aggregation
      if (!areaMap[area]) {
        areaMap[area] = { area, orderCount: 0, revenue: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
      }
      areaMap[area].orderCount++;
      areaMap[area].revenue += amount;
      if (o.status === 'PENDING')   areaMap[area].pending++;
      else if (o.status === 'SHIPPED')    areaMap[area].shipped++;
      else if (o.status === 'DELIVERED')  areaMap[area].delivered++;
      else                                areaMap[area].cancelled++;

      // Seller aggregation
      if (!sellerMap[seller]) {
        sellerMap[seller] = { seller_name: seller, orderCount: 0, revenue: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
      }
      sellerMap[seller].orderCount++;
      sellerMap[seller].revenue += amount;
      if (o.status === 'PENDING')   sellerMap[seller].pending++;
      else if (o.status === 'SHIPPED')    sellerMap[seller].shipped++;
      else if (o.status === 'DELIVERED')  sellerMap[seller].delivered++;
      else                                sellerMap[seller].cancelled++;
    });

    return NextResponse.json({
      byArea:   Object.values(areaMap).sort((a, b) => b.orderCount - a.orderCount),
      bySeller: Object.values(sellerMap).sort((a, b) => b.revenue - a.revenue),
      summary: {
        totalOrders:   orders.length,
        totalRevenue:  orders.reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0),
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
        activeAreas:   Object.keys(areaMap).length,
        activeSellers: Object.keys(sellerMap).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
