import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, total, address, phone, paymentMethod, isPreOrder, couponCode, discountAmount } = body;

    if (!userId || !items || !items.length) {
      return NextResponse.json({ status: "error", message: "Missing Order Integrity Components" }, { status: 400 });
    }

    // Fetch max ID to handle Postgres sequence desync after migration
    const { data: maxOrder } = await supabase.from('orders').select('id').order('id', { ascending: false }).limit(1).single();
    const nextOrderId = (maxOrder?.id || 0) + 1;

    // Resolve customer name from users
    let customerName = "Customer";
    try {
      const { data: userData } = await supabase.from('users').select('name').eq('id', userId).single();
      if (userData?.name) {
        customerName = userData.name;
      }
    } catch (e) {}

    if (!paymentMethod) {
      return NextResponse.json({ status: "error", message: "Missing payment method." }, { status: 400 });
    }

    // Insert master order
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      id: nextOrderId,
      user_id: userId,
      total_amount: total,
      status: 'PENDING',
      delivery_address: address + (phone ? ` | Phone: ${phone}` : ''),
      payment_method: paymentMethod,
      is_pre_order: isPreOrder ? 1 : 0,
      coupon_code: couponCode || null,
      discount_amount: discountAmount || 0
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

    // If coupon was successfully applied, increment its usage count in the registry
    if (couponCode) {
       const { data: cData } = await supabase.from('coupons').select('usage_count').eq('code', couponCode.toUpperCase()).single();
       if (cData) {
         await supabase.from('coupons').update({ usage_count: (cData.usage_count || 0) + 1 }).eq('code', couponCode.toUpperCase());
       }
    }

    // =========================================================================
    // BOS REAL-TIME OPERATIONS SYNC (P0 Recovery Bridge)
    // =========================================================================
    try {
      // 1. Sync / Accumulate in bos_customers
      let customerId = `cust_usr_${userId}`;
      const { data: existingCust } = await supabase
        .from('bos_customers')
        .select('id, total_orders, total_spend')
        .or(`user_id.eq.${userId},phone.eq.${phone || 'none'}`)
        .limit(1)
        .maybeSingle();

      if (existingCust) {
        customerId = existingCust.id;
        const updatedOrders = (existingCust.total_orders || 0) + 1;
        const updatedSpend = (Number(existingCust.total_spend) || 0) + Number(total);
        await supabase.from('bos_customers').update({
          total_orders: updatedOrders,
          total_spend: updatedSpend,
          last_order_at: new Date().toISOString(),
          status: updatedOrders > 1 ? 'REPEAT' : 'ACTIVE',
          address: address || undefined,
          phone: phone || undefined,
          updated_at: new Date().toISOString()
        }).eq('id', customerId);
      } else {
        await supabase.from('bos_customers').insert([{
          id: customerId,
          business_id: 'biz_ocean_exotic_main',
          user_id: String(userId),
          location_id: 'loc_in_an_dollygunj',
          customer_type: 'FAMILY_CUSTOMER',
          display_name: customerName,
          phone: phone || null,
          address: address || null,
          total_orders: 1,
          total_spend: total,
          first_order_at: new Date().toISOString(),
          last_order_at: new Date().toISOString(),
          status: 'ACTIVE',
          health: 'HEALTHY',
          health_reason: 'First order placed via storefront marketplace'
        }]);
      }

      // 2. Log customer timeline event
      await supabase.from('bos_customer_timeline').insert([{
        id: `evt_ord_${orderId}_${Date.now()}`,
        customer_id: customerId,
        event_type: 'ORDER_CREATED',
        title: `Order #${orderId} Placed (₹${total})`,
        description: `Purchased ${items.length} item(s) via web storefront. Payment: ${paymentMethod}.`,
        metadata: { orderId, total, itemsCount: items.length, paymentMethod }
      }]);

      // 3. Create Processing Jobs (Cutting Tickets) in bos_processing_jobs
      const processingJobs = items.map((item: any, idx: number) => ({
        id: `job_ord_${orderId}_${item.id}_${idx + 1}`,
        job_number: `JOB-${orderId}-${idx + 1}`,
        batch_id: `batch_live_inventory`,
        batch_number: `BAT-DEFAULT`,
        product_id: String(item.id),
        product_name: item.name || `Seafood Item #${item.id}`,
        hub_id: 'hub_port_blair_01',
        input_cut_type: 'WHOLE',
        target_cut_type: item.cutType || 'CURRY_CUT',
        primary_stages: ['DESCALING', 'PORTIONING', 'VACUUM_SEAL'],
        operator_name: 'Dollygunj Processing Hub',
        workstation_id: 'WS-01-MAIN',
        status: 'QUEUED',
        raw_input_weight_kg: Number(item.quantity) || 1.00,
        cleaned_output_weight_kg: 0.00,
        total_waste_weight_kg: 0.00,
        yield_percentage: 0.00,
        expected_yield_percentage: 75.00,
        operator_notes: `Order #${orderId} for ${customerName} (${phone || 'No phone'}). Target: ${item.cutType || 'Curry Cut'}`
      }));
      await supabase.from('bos_processing_jobs').insert(processingJobs);

      // 4. Create Logistics Consignment in bos_delivery_orders
      const totalWeightKg = items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1.0), 0);
      await supabase.from('bos_delivery_orders').insert([{
        id: `del_ord_${orderId}`,
        order_id: String(orderId),
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: phone || '9933200000',
        delivery_address: address || 'Dollygunj Hub Pickup',
        location_id: 'loc_in_an_dollygunj',
        locality: 'Dollygunj',
        landmark: 'Near Port Blair Harbor',
        delivery_notes: `Storefront order #${orderId}. Payment: ${paymentMethod}. Total: ₹${total}`,
        hub_id: 'hub_port_blair_01',
        slot_start: '09:00',
        slot_end: '13:00',
        package_count: items.length,
        weight_kg: totalWeightKg,
        priority: 'NORMAL',
        status: 'READY',
        requires_cold_chain: true,
        proof_method: 'OTP'
      }]);

      // 5. System Audit Trail in bos_audit_log
      await supabase.from('bos_audit_log').insert([{
        actor_id: String(userId),
        actor_role: 'CUSTOMER',
        action: 'ORDER_PLACED_COMMERCE_BRIDGE',
        resource: 'orders',
        resource_id: String(orderId),
        location_id: 'loc_in_an_dollygunj',
        status: 'SUCCESS',
        details: { total, itemCount: items.length, paymentMethod }
      }]);
    } catch (bosSyncErr: any) {
      console.error('[Marketplace Checkout] BOS Sync Warning (non-fatal):', bosSyncErr.message || bosSyncErr);
    }

    return NextResponse.json({ status: "success", orderId });
  } catch (error: any) {
    console.error("Marketplace Checkout Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
