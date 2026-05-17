/**
 * LimitedDailySection — Client Component
 * Selling-fast / low-stock items with live countdown timer.
 * Needs client for the countdown ticker only.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import FreshnessIndicator from './FreshnessIndicator';
import type { TodaysCatchItem } from '@/types/marketplace';

interface LimitedDailySectionProps {
  items: TodaysCatchItem[];
}

// Countdown to midnight (inventory expiry)
function MidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-orange-400 font-black">{timeLeft}</span>
  );
}

export default function LimitedDailySection({ items }: LimitedDailySectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="limited-daily" className="py-8 md:py-16 border-t border-[var(--foreground)]/5">
      <div className="container mx-auto px-4 md:px-10 space-y-6 md:space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <p className="text-[9px] md:text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]">
                Limited Daily Inventory
              </p>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[var(--foreground)] tracking-tight uppercase italic">
              Selling Fast
            </h2>
          </div>
          <div className="text-[10px] md:text-xs text-[var(--foreground)]/50 font-medium text-right">
            <p>Today&apos;s stock expires in</p>
            <MidnightCountdown />
          </div>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 md:gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible scrollbar-hide">
          {items.map((item) => (
            <Link
              key={item.catch_id}
              href={`/customer/products/${item.product_id}?catch=${item.catch_id}`}
              className="group relative flex flex-col min-w-[200px] md:min-w-0 rounded-2xl border border-orange-400/20 overflow-hidden bg-orange-400/[0.03] hover:bg-orange-400/[0.07] hover:border-orange-400/40 transition-all duration-300 flex-shrink-0"
            >
              {/* Image */}
              <div className="relative h-36 md:h-44 overflow-hidden bg-[var(--foreground)]/5">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 200px, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🐟</div>
                )}
                {/* Stock % badge */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1 w-full rounded-full bg-black/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-400"
                      style={{ width: `${item.stock_percent}%` }}
                    />
                  </div>
                  <p className="text-[6px] font-black text-white/60 uppercase tracking-widest mt-0.5 text-right">
                    {item.stock_percent}% remaining
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-black text-[var(--foreground)] tracking-tight">{item.name}</h3>
                <p className="text-[7px] text-orange-400/70 uppercase tracking-widest font-bold">
                  🚢 {item.harbor_node}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-black text-[var(--foreground)]">
                    ₹{item.price_per_kg.toLocaleString('en-IN')}
                    <span className="text-[7px] opacity-40 font-bold">/kg</span>
                  </p>
                  <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-400 border border-orange-400/20">
                    {item.remaining_kg.toFixed(1)} kg left
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
