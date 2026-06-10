import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    const dummyReviews = [
      {
        product_id: 'PRD-101',
        product_name: 'Premium Red Snapper (Whole)',
        seller_id: '12345',
        user_id: 'USR-882',
        user_name: 'Arjun Das',
        rating: 5,
        comment: 'Incredible quality. Arrived perfectly chilled and the cuts were incredibly fresh. Will definitely order again from this merchant!',
        status: 'PENDING',
        order_id: 8821,
        evidence_gallery: JSON.stringify(['https://oceanexotic.com/images/snapper1.jpg'])
      },
      {
        product_id: 'PRD-102',
        product_name: 'Tiger Prawns (Jumbo)',
        seller_id: '12345',
        user_id: 'USR-883',
        user_name: 'Priya Sharma',
        rating: 2,
        comment: 'Delivery was late by 4 hours and the ice packs had melted. The prawns still smelled okay but the logistics need serious improvement.',
        status: 'FLAGGED',
        order_id: 8822,
        evidence_gallery: JSON.stringify([])
      },
      {
        product_id: 'PRD-103',
        product_name: 'Yellowfin Tuna Steaks',
        seller_id: '12346',
        user_id: 'USR-884',
        user_name: 'Rahul K.',
        rating: 4,
        comment: 'Great cuts, perfectly portioned for sushi. The packaging was top-notch.',
        status: 'APPROVED',
        order_id: 8823,
        evidence_gallery: JSON.stringify(['https://oceanexotic.com/images/tuna1.jpg', 'https://oceanexotic.com/images/tuna2.jpg'])
      }
    ];

    const { error } = await supabase.from('reviews').insert(dummyReviews);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Dummy reviews injected' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
