import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPhpServerUrl } from '@/config/api';
import { translateObject, translateArray } from '@/lib/translate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const targetLang = request.headers.get('Accept-Language');

    if (!id) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

    if (process.env.NODE_ENV === 'production') {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      const productIds = (items || []).map((item: any) => item.product_id).filter(Boolean);
      let products: any[] = [];
      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, image_url, seller_id')
          .in('id', productIds);
        products = productsData || [];
      }

      const productMap = products.reduce((acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Get seller details
      const sellerIds = products.map(p => p.seller_id).filter(Boolean);
      let sellersMap: any = {};
      if (sellerIds.length > 0) {
        const { data: sellersData } = await supabase.from('sellers').select('id, name').in('id', sellerIds);
        sellersMap = (sellersData || []).reduce((acc: any, s: any) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }

      const itemsWithDetails = (items || []).map((item: any) => {
        const p = productMap[item.product_id];
        return {
          ...item,
          product_name: p?.name || item.product_id,
          image_url: p?.image_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400",
          seller_id: item.seller_id || p?.seller_id,
          seller_name: sellersMap[item.seller_id || p?.seller_id]?.name || "OceanExotic Merchant"
        };
      });

      const subtotal = itemsWithDetails.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1), 0);
      const total = parseFloat(order.total_amount) || 0;
      const shipping = 0;
      const tax = Math.round(Math.max(0, total - subtotal - shipping) * 100) / 100;

      let translatedItems = itemsWithDetails;
      let translatedOrder = order;

      if (targetLang && !targetLang.toLowerCase().startsWith("en")) {
        translatedItems = await translateArray(itemsWithDetails, ['product_name'], targetLang);
        translatedOrder = await translateObject(order, ['delivery_address', 'delivery_area'], targetLang);
      }

      return NextResponse.json({
        ...translatedOrder,
        subtotal,
        shipping,
        tax,
        total,
        items: translatedItems
      });
    }

    const phpServerUrl = getPhpServerUrl();
    const phpApiUrl = `${phpServerUrl}/FISH_MARKET/api/orders/details.php?id=${id}`;
    
    const response = await fetch(phpApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    let translatedItems = data.items || [];
    let translatedOrder = data;

    if (targetLang && !targetLang.toLowerCase().startsWith("en")) {
      translatedItems = await translateArray(translatedItems, ['product_name'], targetLang);
      translatedOrder = await translateObject(data, ['delivery_address', 'delivery_area'], targetLang);
    }

    return NextResponse.json({
      ...translatedOrder,
      items: translatedItems
    });
  } catch (error: any) {
    console.error("User Order Details API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
