/**
 * TodaysCatchSection — Server Component
 * Renders live today's catch section for the homepage.
 * Data fetched server-side (no-cache) — truly live.
 */

import Link from 'next/link';
import Image from 'next/image';
import { getTodaysCatch } from '@/services/catchService';
import FreshnessIndicator from './FreshnessIndicator';
import type { TodaysCatchItem } from '@/types/marketplace';
import { cn } from '@/lib/utils';

// ─── Single Catch Card ────────────────────────────────────────────────────────

function CatchCard({ item }: { item: TodaysCatchItem }) {
  const isSoldOut = item.catch_status === 'SOLD_OUT';
  const isSellingFast = item.catch_status === 'SELLING_FAST';

  return (
    <Link
      href={`/customer/products/${item.product_id}?catch=${item.catch_id}`}
      className={cn(
        'group relative flex flex-col rounded-2xl border overflow-hidden bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] transition-all duration-300',
        'border-[var(--foreground)]/8 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]',
        isSoldOut && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Image */}
      <div className="relative h-40 md:h-48 overflow-hidden bg-[var(--foreground)]/5">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl md:text-6xl select-none">
            🐟
          </div>
        )}

        {/* Batch badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white/80 border border-white/10">
            {item.batch_label} CATCH
          </span>
        </div>

        {/* Selling fast flame */}
        {isSellingFast && (
          <div className="absolute top-2 right-2 text-xs animate-pulse">🔥</div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 md:p-4 space-y-3">
        {/* Name + category */}
        <div>
          <p className="text-[8px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest">{item.category}</p>
          <h3 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tight leading-tight">{item.name}</h3>
        </div>

        {/* Freshness */}
        <FreshnessIndicator
          label={item.freshness_label}
          pct={item.freshness_pct}
          minutesSince={item.minutes_since_catch}
          harborNode={item.harbor_node}
          catchStatus={item.catch_status}
          stockPercent={item.stock_percent}
        />

        {/* Price + stock */}
        <div className="flex items-end justify-between pt-1 border-t border-[var(--foreground)]/5">
          <div>
            <p className="text-[7px] text-[var(--foreground)]/40 uppercase tracking-widest">per kg</p>
            <p className="text-base md:text-lg font-black text-[var(--foreground)]">
              ₹{item.price_per_kg.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-[var(--foreground)]/40 uppercase tracking-widest">available</p>
            <p className="text-sm font-black text-primary">{item.remaining_kg.toFixed(1)} kg</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Section Skeleton ─────────────────────────────────────────────────────────

export function TodaysCatchSkeleton() {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-10">
        <div className="h-8 w-48 bg-[var(--foreground)]/5 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[var(--foreground)]/5 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default async function TodaysCatchSection() {
  const data = await getTodaysCatch();

  if (data.status === 'error' || data.total === 0) {
    return null; // Fail silently — homepage can function without it
  }

  const morning   = data.by_batch.MORNING;
  const afternoon = data.by_batch.AFTERNOON;
  const evening   = data.by_batch.EVENING;

  const renderBatch = (items: TodaysCatchItem[], label: string, emoji: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <h3 className="text-[10px] md:text-xs font-black text-[var(--foreground)]/60 uppercase tracking-[0.3em]">
            {label}
          </h3>
          <div className="flex-1 h-px bg-[var(--foreground)]/5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {items.map((item) => (
            <CatchCard key={item.catch_id} item={item} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="todays-catch" className="py-8 md:py-16 border-t border-[var(--foreground)]/5">
      <div className="container mx-auto px-4 md:px-10 space-y-8 md:space-y-12">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                Live Harbor Inventory · {data.catch_date}
              </p>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[var(--foreground)] tracking-tight uppercase italic">
              Today&apos;s Catch
            </h2>
            <p className="text-[10px] md:text-xs text-[var(--foreground)]/50 font-medium">
              {data.total} species available · Inventory expires midnight
            </p>
          </div>
          <Link
            href="/todays-catch"
            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            VIEW ALL TODAY&apos;S CATCH →
          </Link>
        </div>

        {/* Batch groups */}
        <div className="space-y-8 md:space-y-12">
          {renderBatch(morning,   'Morning Catch — Harbor Arrivals 4AM–10AM',  '🌅')}
          {renderBatch(afternoon, 'Afternoon Catch — Fresh Hauls 10AM–4PM',    '☀️')}
          {renderBatch(evening,   'Evening Catch — Late Harbor Stock',          '🌙')}
        </div>

      </div>
    </section>
  );
}
