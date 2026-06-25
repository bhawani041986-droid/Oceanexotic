import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPhpServerUrl } from '@/config/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/search?q=tuna&category=Seawater+Fish
 *
 * Production  → queries Supabase directly (avoids self-referencing loop)
 * Local dev   → proxies to PHP at localhost:8081
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim();
    const category = (searchParams.get('category') ?? '').trim();

    // ── PRODUCTION: query Supabase directly ──────────────────────────────────
    if (process.env.NODE_ENV === 'production') {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      if (category && category !== 'All Seafood') {
        query = query.ilike('category', `%${category}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const results = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category ?? '',
        price: Number(p.price) || 0,
        image: p.image_url ?? '',
        rating: 4.5,
        seller: p.seller_name ?? 'Verified Fleet',
        is_live: false,
        harbor: null,
        stock: p.stock ?? null,
        batch: null,
        tag: 'FRESH CATCH',
      }));

      return NextResponse.json(
        { status: 'success', query: q, results, total: results.length },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // ── LOCAL DEV: proxy to PHP ───────────────────────────────────────────────
    const phpServerUrl = getPhpServerUrl();
    const phpUrl = `${phpServerUrl}/FISH_MARKET/api/products/search.php?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`;

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
    console.error('Product Search API Error:', err);
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}

