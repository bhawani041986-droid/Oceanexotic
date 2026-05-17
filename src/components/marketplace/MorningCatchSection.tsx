/**
 * MorningCatchSection — Server Component
 * High-fidelity section for the earliest harbor arrivals.
 */

import Link from 'next/link';
import Image from 'next/image';
import { getMorningCatch } from '@/services/catchService';
import FreshnessIndicator from './FreshnessIndicator';
import { cn } from '@/lib/utils';

export default async function MorningCatchSection() {
  const data = await getMorningCatch();
  const items = data.items.slice(0, 4);

  if (data.status === 'error' || items.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-emerald-500/[0.02] border-y border-emerald-500/5">
      <div className="container mx-auto px-4 md:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌅</span>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                Morning Harbor Arrivals · 4AM–10AM
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[var(--foreground)] tracking-tight uppercase italic">
              The Morning Haul
            </h2>
            <p className="text-xs md:text-sm text-[var(--foreground)]/50 max-w-xl">
              Straight from the jetties of Port Blair. These batches arrived before sunrise and are ready for same-day delivery.
            </p>
          </div>
          <Link
            href="/todays-catch?batch=MORNING"
            className="h-12 px-8 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 transition-all"
          >
            EXPLORE MORNING BATCH →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item) => (
            <Link
              key={item.catch_id}
              href={`/customer/products/${item.product_id}?catch=${item.catch_id}`}
              className="group relative block"
            >
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 group-hover:border-emerald-500/30 transition-all duration-500">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-1000">
                    🐟
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                  <FreshnessIndicator
                    label={item.freshness_label}
                    pct={item.freshness_pct}
                    minutesSince={item.minutes_since_catch}
                    harborNode={item.harbor_node}
                    variant="compact"
                  />
                  <div className="flex items-end justify-between pt-3 border-t border-white/10">
                    <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Today&apos;s Price</p>
                      <p className="text-xl font-black text-white italic">₹{item.price_per_kg}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Remaining</p>
                      <p className="text-base font-black text-emerald-400">{item.remaining_kg} kg</p>
                    </div>
                  </div>
                </div>

                {/* Batch Tag */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    FIRST HAUL
                  </span>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-black text-[var(--foreground)] uppercase italic group-hover:text-emerald-500 transition-colors">
                {item.name}
              </h3>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
