import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, total, address, phone, paymentMethod, isPreOrder } = body;

    if (!userId || !items || !items.length) {
      return NextResponse.json({ status: "error", message: "Missing Order Integrity Components" }, { status: 400 });
    }

    // Fetch max ID to handle Postgres sequence desync after migration
    const { data: maxOrder } = await supabase.from('orders').select('id').order('id', { ascending: false }).limit(1).single();
    const nextOrderId = (maxOrder?.id || 0) + 1;

    // Insert master order
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      id: nextOrderId,
      user_id: userId,
      total_amount: total,
      status: 'PENDING',
      delivery_address: address,
      payment_method: paymentMethod || 'COD',
      is_pre_order: isPreOrder ? 1 : 0
    }]).select().single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    // Fetch max ID for order items
    const { data: maxOrderItem } = await supabase.from('order_items').select('id').order('id', { ascending: false }).limit(1).single();
    let nextOrderItemId = (maxOrderItem?.id || 0) + 1;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      id: nextOrderItemId++,
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      // rollback order if items fail
      await supabase.from('orders').delete().eq('id', orderId);
      throw itemsError;
    }

    return NextResponse.json({ status: "success", orderId });
  } catch (error: any) {
    console.error("Marketplace Checkout Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
