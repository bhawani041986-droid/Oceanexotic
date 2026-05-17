/**
 * OceanExotic Live Marketplace Types
 * Strict TypeScript — covers all live harbor marketplace data shapes.
 */

// ─── Cut Types ────────────────────────────────────────────────────────────────

export type CutTypeKey =
  | 'WHOLE'
  | 'CURRY_CUT'
  | 'STEAK_CUT'
  | 'FILLET'
  | 'CLEANED'
  | 'UNCLEANED'
  | 'HEAD_ON'
  | 'HEAD_OFF'
  | 'SKIN_ON'
  | 'SKIN_OFF';

export interface CutOption {
  id: string;
  cut_type: CutTypeKey;
  label: string;
  desc: string;
  icon: string;
  price_modifier_percent: number;
  price_flat_add: number;
  final_price: number;
  is_available: boolean;
  stock_kg: number | null;
  sort_order: number;
}

// ─── Freshness ────────────────────────────────────────────────────────────────

export type FreshnessLabel =
  | 'JUST ARRIVED'
  | 'SUPER FRESH'
  | 'FRESH TODAY'
  | 'SAME DAY CATCH';

export type CatchStatus =
  | 'FRESH'
  | 'SELLING_FAST'
  | 'SOLD_OUT'
  | 'ARCHIVED';

export type BatchLabel = 'MORNING' | 'AFTERNOON' | 'EVENING';

// ─── Today's Catch ────────────────────────────────────────────────────────────

export interface TodaysCatchItem {
  catch_id: string;
  product_id: string;
  seller_id: string;
  catch_date: string;           // YYYY-MM-DD
  harbor_node: string;
  quantity_kg: number;
  remaining_kg: number;
  price_per_kg: number;
  freshness_timestamp: string;  // ISO datetime
  expires_at: string;           // ISO datetime
  batch_label: BatchLabel;
  catch_status: CatchStatus;
  catch_image_url: string | null;
  notes: string | null;
  minutes_since_catch: number;
  stock_percent: number;
  freshness_label: FreshnessLabel;
  freshness_pct: number;        // 0-100
  // From products join
  name: string;
  category: string;
  description: string;
  image_url: string | null;
  gallery: string[];
  unit: string;
  // From sellers join
  seller_name: string | null;
}

export interface TodaysCatchResponse {
  status: 'success' | 'error';
  catch_date: string;
  generated_at: string;
  total: number;
  items: TodaysCatchItem[];
  by_batch: {
    MORNING: TodaysCatchItem[];
    AFTERNOON: TodaysCatchItem[];
    EVENING: TodaysCatchItem[];
  };
}

// ─── Cut Options Response ─────────────────────────────────────────────────────

export interface CutOptionsResponse {
  status: 'success' | 'error';
  product_id: string;
  base_price: number;
  cut_options: CutOption[];
}

// ─── Cart Item (live marketplace aware) ───────────────────────────────────────

export interface LiveCartItem {
  product_id: string;
  catch_id: string;
  product_name: string;
  cut_type: CutTypeKey;
  cut_label: string;
  quantity_kg: number;
  price_per_kg: number;
  total_price: number;
  harbor_node: string;
  catch_date: string;
  seller_id: string;
  image_url: string | null;
}

// ─── Harbor Nodes ─────────────────────────────────────────────────────────────

export const HARBOR_NODES = [
  'Port Blair Harbor',
  'Aberdeen Bazaar Jetty',
  'Phoenix Bay Harbor',
  'Haddo Wharf',
  'Junglighat Pier',
  'Dollygunj Jetty',
  'Garacharma Dock',
  'Bhatubasti Landing',
] as const;

export type HarborNode = typeof HARBOR_NODES[number];
