import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) throw orderError;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Fetch items manually to avoid foreign key issues
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    // Fetch product details for names and images
    const productIds = (items || []).map((item: any) => item.product_id).filter(Boolean);
    let products: any[] = [];
    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, image_url')
        .in('id', productIds);
      products = productsData || [];
    }

    const productMap = products.reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const itemsWithDetails = (items || []).map((item: any) => ({
      ...item,
      product_name: productMap[item.product_id]?.name || item.product_id,
      image_url: productMap[item.product_id]?.image_url || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400"
    }));

    // Calculate dynamic financial breakdown
    const subtotal = itemsWithDetails.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1), 0);
    const total = parseFloat(order.total_amount) || 0;
    const shipping = 0; // Complimentary standard delivery
    const tax = Math.round(Math.max(0, total - subtotal - shipping) * 100) / 100;

    return NextResponse.json({
      ...order,
      subtotal,
      shipping,
      tax,
      total,
      items: itemsWithDetails
    });
  } catch (error: any) {
    console.error("User Order Details API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
