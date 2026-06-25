import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy to the PHP search endpoint.
 * GET /api/products/search?q=tuna&category=Seawater+Fish
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? '';
    const category = searchParams.get('category') ?? '';
    const sort = searchParams.get('sort') ?? 'popular';

    // In production, forward to the PHP backend on the same server
    const phpBase =
      process.env.NODE_ENV === 'production'
        ? 'https://oceanexotic.com'
        : 'http://127.0.0.1:8081/FISH_MARKET';

    const phpUrl = `${phpBase}/api/products/search.php?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`;

    const phpRes = await fetch(phpUrl, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!phpRes.ok) {
      return NextResponse.json(
        { status: 'error', message: `PHP search returned ${phpRes.status}` },
        { status: phpRes.status }
      );
    }

    const text = await phpRes.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { status: 'error', message: 'Invalid JSON from PHP search endpoint' },
        { status: 502 }
      );
    }

    return new NextResponse(JSON.stringify(json), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}
