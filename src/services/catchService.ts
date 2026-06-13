/**
 * catchService.ts
 * SERVER-SIDE ONLY — fetches live harbor catch data.
 * Never import in client components — use the API route instead.
 */

import type { TodaysCatchResponse, CutOptionsResponse } from '@/types/marketplace';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8081/FISH_MARKET/api';

// Shared fetch options — no-cache for live inventory pages
const LIVE_FETCH: RequestInit = {
  cache: 'no-store',
  next: { revalidate: 0 },
};

// ISR 5min for SEO pages
const SEO_FETCH: RequestInit = {
  next: { revalidate: 300 },
};

/**
 * Fetch today's full live catch for the homepage.
 * Uses no-store since inventory changes constantly.
 */
export async function getTodaysCatch(batch?: 'MORNING' | 'AFTERNOON' | 'EVENING'): Promise<TodaysCatchResponse> {
  const url = new URL(`${API_BASE}/seller/products`);
  if (batch) url.searchParams.set('batch', batch);
  url.searchParams.set('limit', '20');

  try {
    const res = await fetch(url.toString(), LIVE_FETCH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<TodaysCatchResponse>;
  } catch {
    return {
      status: 'error' as const,
      catch_date: new Date().toISOString().slice(0, 10),
      generated_at: new Date().toISOString(),
      total: 0,
      items: [],
      by_batch: { MORNING: [], AFTERNOON: [], EVENING: [] },
    };
  }
}

/**
 * Fetch today's morning catch specifically (homepage hero section).
 */
export async function getMorningCatch(): Promise<TodaysCatchResponse> {
  return getTodaysCatch('MORNING');
}

/**
 * Fetch limited/selling-fast items (low stock).
 */
export async function getLimitedCatch(): Promise<TodaysCatchResponse> {
  const url = `${API_BASE}/seller/products?limit=6`;
  try {
    const res = await fetch(url, LIVE_FETCH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: TodaysCatchResponse = await res.json();
    // Filter to selling-fast
    const limited = data.items.filter(
      (i) => i.catch_status === 'SELLING_FAST' || i.stock_percent <= 40
    );
    return { ...data, items: limited, total: limited.length };
  } catch {
    return {
      status: 'error' as const,
      catch_date: new Date().toISOString().slice(0, 10),
      generated_at: new Date().toISOString(),
      total: 0,
      items: [],
      by_batch: { MORNING: [], AFTERNOON: [], EVENING: [] },
    };
  }
}

/**
 * Fetch cut options for a product — used in server-side product page rendering.
 * Uses ISR 5min since cut options don't change frequently.
 */
export async function getCutOptions(productId: string): Promise<CutOptionsResponse> {
  const url = `${API_BASE}/products/cut_options.php?product_id=${encodeURIComponent(productId)}`;
  try {
    const res = await fetch(url, SEO_FETCH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<CutOptionsResponse>;
  } catch {
    return {
      status: 'error' as const,
      product_id: productId,
      base_price: 0,
      cut_options: [],
    };
  }
}
/**
 * Fetch detailed live information for a specific product.
 */
export async function getProductLiveDetail(productId: string): Promise<any> {
  const url = `${API_BASE}/seller/products.php?id=${encodeURIComponent(productId)}`;
  try {
    const res = await fetch(url, LIVE_FETCH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}
