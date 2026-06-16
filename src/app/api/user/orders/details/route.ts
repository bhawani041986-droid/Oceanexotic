import { NextRequest, NextResponse } from 'next/server';
import { getPhpServerUrl } from '@/config/api';
import { translateObject, translateArray } from '@/lib/translate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const targetLang = request.headers.get('Accept-Language');

    if (!id) return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });

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
