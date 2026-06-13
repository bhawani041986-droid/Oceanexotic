import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('product_id');
    const area = req.nextUrl.searchParams.get('area');
    
    if (!productId) {
      return NextResponse.json({ status: "error", message: "Missing product_id" }, { status: 400 });
    }

    const phpServerUrl = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8081/FISH_MARKET/api';
    let url = `${phpServerUrl}/products/cut_options.php?product_id=${encodeURIComponent(productId)}`;
    if (area) {
      url += `&area=${encodeURIComponent(area)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`PHP Server returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Cut Options API Proxy Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
