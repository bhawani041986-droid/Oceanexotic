/**
 * FreshnessIndicator — Server Component
 * Displays real-time freshness badge for a catch item.
 * No client JS needed — pure render from props.
 */

import { cn } from '@/lib/utils';
import type { FreshnessLabel, CatchStatus } from '@/types/marketplace';

interface FreshnessIndicatorProps {
  label: FreshnessLabel;
  pct: number;           // 0-100
  minutesSince: number;
  harborNode: string;
  catchStatus?: CatchStatus;
  stockPercent?: number;
  variant?: 'compact' | 'default';
  className?: string;
}

const FRESHNESS_COLORS: Record<FreshnessLabel, { bar: string; text: string; bg: string }> = {
  'JUST ARRIVED':    { bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'SUPER FRESH':     { bar: 'bg-green-400',   text: 'text-green-400',   bg: 'bg-green-400/10'   },
  'FRESH TODAY':     { bar: 'bg-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-400/10'  },
  'SAME DAY CATCH':  { bar: 'bg-orange-400',  text: 'text-orange-400',  bg: 'bg-orange-400/10'  },
};

const STATUS_BADGE: Record<CatchStatus, { label: string; cls: string }> = {
  FRESH:        { label: '● FRESH',        cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  SELLING_FAST: { label: '🔥 SELLING FAST', cls: 'text-orange-400  bg-orange-400/10  border-orange-400/20'  },
  SOLD_OUT:     { label: '○ SOLD OUT',     cls: 'text-red-400     bg-red-400/10     border-red-400/20'     },
  ARCHIVED:     { label: '— ARCHIVED',     cls: 'text-gray-400    bg-gray-400/10    border-gray-400/20'    },
};

export default function FreshnessIndicator({
  label,
  pct,
  minutesSince,
  harborNode,
  catchStatus,
  stockPercent,
  variant = 'default',
  className,
}: FreshnessIndicatorProps) {
  const colors = FRESHNESS_COLORS[label];
  const statusBadge = catchStatus ? STATUS_BADGE[catchStatus] : null;
  const hoursAgo = minutesSince < 60
    ? `${minutesSince}m ago`
    : `${Math.floor(minutesSince / 60)}h ${minutesSince % 60}m ago`;

  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={cn('text-[7px] font-black uppercase tracking-widest', colors.text)}>
            {label} ({pct}%)
          </span>
          <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">
            🚢 {harborNode} • {hoursAgo}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', colors.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Status + harvest time */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {statusBadge && (
          <span className={cn('text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border', statusBadge.cls)}>
            {statusBadge.label}
          </span>
        )}
        <span className="text-[7px] md:text-[8px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest">
          🚢 {harborNode} • {hoursAgo}
        </span>
      </div>

      {/* Freshness bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn('text-[7px] font-black uppercase tracking-widest', colors.text)}>
            {label}
          </span>
          <span className="text-[7px] text-[var(--foreground)]/30 font-bold">{pct}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-[var(--foreground)]/10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', colors.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stock bar */}
      {stockPercent !== undefined && stockPercent < 100 && (
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">
              Remaining Stock
            </span>
            <span className="text-[7px] text-[var(--foreground)]/30 font-bold">{stockPercent}%</span>
          </div>
          <div className="h-0.5 w-full rounded-full bg-[var(--foreground)]/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                stockPercent > 60 ? 'bg-emerald-400' :
                stockPercent > 30 ? 'bg-yellow-400' : 'bg-red-400'
              )}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
