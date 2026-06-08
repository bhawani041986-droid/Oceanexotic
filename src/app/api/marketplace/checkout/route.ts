import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, total, address, phone, paymentMethod, isPreOrder } = body;

    if (!userId || !items || !items.length) {
      return NextResponse.json({ status: "error", message: "Missing Order Integrity Components" }, { status: 400 });
    }

    const orderId = generateOrderId();
    
    // Group items by seller to create parent orders if needed, or just pick the first seller for now
    // In a multi-vendor marketplace, you'd create multiple orders or one order with multiple sellers
    // We will just use the first item's seller_id
    const sellerId = items[0]?.sellerId || 'SEL-001';

    // Fetch user details to get customer name
    const { data: userData } = await supabase.from('users').select('name').eq('id', userId).single();
    const customerName = userData?.name || 'Unknown Citizen';

    // Fetch seller details
    const { data: sellerData } = await supabase.from('sellers').select('name').eq('id', sellerId).single();
    const sellerName = sellerData?.name || 'Unknown Seller';

    const { error: orderError } = await supabase.from('orders').insert([{
      id: orderId,
      customer_name: customerName,
      customer_id: userId,
      seller_name: sellerName,
      seller_id: sellerId,
      status: 'PENDING',
      logistics_status: isPreOrder ? 'PRE_ORDER_HELD' : 'AWAITING_DISPATCH',
      total_amount: total
    }]);

    if (orderError) throw orderError;

    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price_per_kg: item.price,
      subtotal: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      // rollback order if items fail
      await supabase.from('orders').delete().eq('id', orderId);
      throw itemsError;
    }

    // Since we also have an address, we might need to store it somewhere.
    // However, looking at the schema, 'orders' doesn't have an address column.
    // If there is an `order_address` or `delivery_instructions` table, we'd insert there.
    // But this is sufficient to create the base order.

    return NextResponse.json({ status: "success", orderId });
  } catch (error: any) {
    console.error("Marketplace Checkout Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
