import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const area = searchParams.get('area');

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const phpServerUrl = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8081/FISH_MARKET/api';
    let url = `${phpServerUrl}/seller/products.php?id=${encodeURIComponent(id)}`;
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
    console.error("Product Detail API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
