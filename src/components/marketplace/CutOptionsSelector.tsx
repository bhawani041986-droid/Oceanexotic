'use client';

/**
 * CutOptionsSelector — Client Component
 * Renders cut options BEFORE "Add to Cart".
 * Controlled form — all state managed in component.
 * Receives cut options pre-fetched server-side as props.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { CutOption, CutTypeKey } from '@/types/marketplace';

interface SelectedCuts {
  primary: CutTypeKey | null;      // e.g. WHOLE, CURRY_CUT, FILLET
  cleaning: CutTypeKey | null;     // CLEANED | UNCLEANED
  head: CutTypeKey | null;         // HEAD_ON | HEAD_OFF
  skin: CutTypeKey | null;         // SKIN_ON | SKIN_OFF
}

interface CutOptionsSelectorProps {
  cutOptions: CutOption[];
  basePrice: number;
  onSelectionChange: (cuts: SelectedCuts, finalPrice: number) => void;
  className?: string;
}

// Group cuts by category
const CUT_GROUPS = {
  primary:  ['WHOLE', 'CURRY_CUT', 'STEAK_CUT', 'FILLET'] as CutTypeKey[],
  cleaning: ['CLEANED', 'UNCLEANED'] as CutTypeKey[],
  head:     ['HEAD_ON', 'HEAD_OFF'] as CutTypeKey[],
  skin:     ['SKIN_ON', 'SKIN_OFF'] as CutTypeKey[],
};

type GroupKey = keyof typeof CUT_GROUPS;

const GROUP_LABELS: Record<GroupKey, string> = {
  primary:  'How would you like it cut?',
  cleaning: 'Cleaning preference',
  head:     'Head preference',
  skin:     'Skin preference',
};

export default function CutOptionsSelector({
  cutOptions,
  basePrice,
  onSelectionChange,
  className,
}: CutOptionsSelectorProps) {
  const [selected, setSelected] = useState<SelectedCuts>({
    primary: null,
    cleaning: null,
    head: null,
    skin: null,
  });

  // Index cut options by type for O(1) lookup
  const optionMap = new Map<CutTypeKey, CutOption>(
    cutOptions.map((o) => [o.cut_type, o])
  );

  const computeFinalPrice = useCallback(
    (cuts: SelectedCuts): number => {
      let price = basePrice;
      Object.values(cuts).forEach((cutType) => {
        if (!cutType) return;
        const opt = optionMap.get(cutType);
        if (!opt) return;
        price = price * (1 + opt.price_modifier_percent / 100) + opt.price_flat_add;
      });
      return Math.round(price);
    },
    [basePrice, optionMap]
  );

  const handleSelect = useCallback(
    (group: GroupKey, cutType: CutTypeKey) => {
      const opt = optionMap.get(cutType);
      if (!opt?.is_available) return;

      setSelected((prev) => ({
        ...prev,
        [group]: prev[group] === cutType ? null : cutType,
      }));
    },
    [optionMap]
  );

  // Notify parent on state change - FIXED: Using useEffect to avoid state update during render
  React.useEffect(() => {
    onSelectionChange(selected, computeFinalPrice(selected));
  }, [selected, onSelectionChange, computeFinalPrice]);

  // Render a single group row
  const renderGroup = (group: GroupKey) => {
    const types = CUT_GROUPS[group];
    const available = types.filter((t) => optionMap.has(t));
    if (available.length === 0) return null;

    return (
      <div key={group} className="space-y-2">
        <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)]/60 uppercase tracking-[0.2em]">
          {GROUP_LABELS[group]}
        </p>
        <div className="flex flex-wrap gap-2">
          {available.map((cutType) => {
            const opt = optionMap.get(cutType)!;
            const isSelected = selected[group] === cutType;
            const isDisabled = !opt.is_available;
            const priceDelta = opt.price_flat_add > 0
              ? `+₹${opt.price_flat_add}`
              : opt.price_modifier_percent > 0
              ? `+${opt.price_modifier_percent}%`
              : opt.price_modifier_percent < 0
              ? `${opt.price_modifier_percent}%`
              : null;

            return (
              <button
                key={cutType}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(group, cutType)}
                title={opt.desc}
                className={cn(
                  'relative flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl border text-left transition-all duration-150',
                  'text-[8px] md:text-[9px] font-black uppercase tracking-wider',
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_0_1px_var(--primary)]'
                    : 'bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]',
                  isDisabled && 'opacity-30 cursor-not-allowed line-through'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </span>
                {priceDelta && (
                  <span
                    className={cn(
                      'text-[7px] font-bold',
                      isSelected ? 'text-primary' : 'text-[var(--foreground)]/40'
                    )}
                  >
                    {priceDelta}
                  </span>
                )}
                {isDisabled && (
                  <span className="absolute top-0.5 right-1 text-[6px] text-danger font-black uppercase">
                    N/A
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const finalPrice = computeFinalPrice(selected);
  const hasSelection = Object.values(selected).some(Boolean);

  return (
    <div className={cn('space-y-4 p-4 md:p-5 rounded-2xl bg-[var(--foreground)]/[0.03] border border-[var(--foreground)]/5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.25em]">
          Choose Your Cut
        </p>
        {hasSelection && (
          <span className="text-[10px] md:text-xs font-black text-primary">
            ₹{finalPrice.toLocaleString('en-IN')}<span className="text-[7px] opacity-60">/kg</span>
          </span>
        )}
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {(Object.keys(CUT_GROUPS) as GroupKey[]).map(renderGroup)}
      </div>

      {/* Freshness note */}
      <p className="text-[7px] md:text-[8px] text-[var(--foreground)]/30 font-medium italic">
        ✦ All cuts made fresh at harbor before dispatch. Cleaning takes approx 20 min.
      </p>
    </div>
  );
}
