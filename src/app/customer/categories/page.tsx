"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Anchor, 
  Droplets, 
  ChevronRight, 
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import dynamic from 'next/dynamic';

const OceanReelsFeed = dynamic(
  () => import('@/components/video/OceanReelsFeed').then((mod) => mod.OceanReelsFeed),
  { ssr: false }
);
import Link from "next/link";

import { useCategories } from "@/hooks/useCategories";
import { MASTER_PRODUCT_REGISTRY } from "@/constants/products";

const CATEGORY_UI_MAPPING: Record<string, { desc: string, icon: string, color: string }> = {
  'FRESHWATER FISH': { icon: "🐟", color: "from-cyan-500/20", desc: "Freshwater river catch and aquaculture species." },
  'SEAWATER FISH': { icon: "🌊", color: "from-blue-500/20", desc: "Ocean and deep-sea products from the maritime sector." },
  'PRAWNS & SHRIMPS': { icon: "🍤", color: "from-orange-500/20", desc: "Premium prawns and shrimps sourced for global trade." },
  'CRABS & LOBSTERS': { icon: "🦀", color: "from-red-500/20", desc: "Elite mud crabs and lobsters from sustainable reefs." },
  'STEAKS & FILLETS': { icon: "🥩", color: "from-rose-500/20", desc: "Premium cuts, steaks, and fillets for culinary excellence." },
  'FROZEN': { icon: "❄️", color: "from-sky-500/20", desc: "Flash-frozen maritime assets preserving maximum freshness." },
  'DRY FISH': { icon: "🐡", color: "from-amber-500/20", desc: "Coastal dry fish and preserved delicacies." },
  'READY TO COOK': { icon: "🍳", color: "from-emerald-500/20", desc: "Marinated, prepped, and ready-to-cook selections." },
  'MUTTON': { icon: "🥩", color: "from-red-500/20", desc: "Fresh premium mutton cuts, ribs, and minced meat." },
  'CHICKEN': { icon: "🍗", color: "from-yellow-500/20", desc: "High-quality chicken, breast cuts, drumsticks, and wings." }
};

export default function CustomerCategoriesPage() {
  const { categories: ALL_CATEGORIES } = useCategories();
  const PRODUCT_CATEGORIES = ALL_CATEGORIES.filter(cat => (cat.status || "ACTIVE") === "ACTIVE");
  
  const CATEGORIES = PRODUCT_CATEGORIES.map((cat, idx) => {
    const labelLower = (cat.label || "").toLowerCase();
    let badgeTag = cat.badgeTag || null;
    if (!badgeTag) {
      if (labelLower.includes("surmai") || labelLower.includes("prawn") || labelLower.includes("shrimp")) badgeTag = "🔥 HOT";
      else if (labelLower.includes("seawater") || labelLower.includes("crab") || labelLower.includes("freshwater")) badgeTag = "⚡ FRESH";
      else if (labelLower.includes("steak") || labelLower.includes("exotic")) badgeTag = "✨ CHILLED";
      else if (labelLower.includes("cook") || labelLower.includes("ready")) badgeTag = "✨ CHILLED";
      else badgeTag = "⚡ FRESH";
    }
    return {
      id: cat.id,
      name: cat.label,
      imageUrl: cat.imageUrl,
      badgeTag,
      count: MASTER_PRODUCT_REGISTRY.filter(p => p.category === cat.id).length,
      icon: CATEGORY_UI_MAPPING[cat.id]?.icon || "🐟",
      desc: CATEGORY_UI_MAPPING[cat.id]?.desc || "Premium maritime product.",
      color: CATEGORY_UI_MAPPING[cat.id]?.color || "from-blue-500/20"
    };
  });
  return (

    <div className="space-y-[10px] md:space-y-16 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-8 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-2 md:space-y-4 max-w-2xl">
          <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[8px] md:text-[10px]">HARBOR CATEGORIES</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none italic">
            Explore the <span className="text-primary italic">Product.</span>
          </h1>
          <p className="text-[10px] md:text-sm font-medium text-text-secondary leading-tight md:leading-relaxed italic">
            Browse our fresh seafood catalog by category and species.
          </p>
        </div>
        <div className="relative group w-full md:w-80">
          <input 
            placeholder="Search categories..." 
            className="w-full h-12 md:h-14 pl-12 md:pl-14 pr-6 bg-bg-secondary border border-[var(--foreground)]/5 rounded-lg md:rounded-[20px] text-xs md:text-sm font-bold text-[var(--foreground)] focus:border-primary/50 transition-all outline-none italic"
          />
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] md:gap-10">
        {CATEGORIES.map((cat, idx) => (
          <Link key={cat.id} href={`/customer/products?category=${cat.name}`}>
            <Card 
              className={`p-[4px] md:p-1 group cursor-pointer transition-all hover:border-primary/40 bg-gradient-to-br ${cat.color} to-bg-secondary/40 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[32px] animate-underwater-float`}
              style={{ animationDelay: `${(idx % 3) * 0.25}s` }}
            >
              <div className="p-4 md:p-10 space-y-4 md:space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-[24px] bg-teal-950/20 border border-teal-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 overflow-hidden animate-breathing-zoom">
                       {cat.imageUrl ? (
                         <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-2xl md:text-4xl">{cat.icon}</span>
                       )}
                    </div>
                    <div className="flex items-center gap-2">
                       {cat.badgeTag && (
                         <Badge variant="glass" className="bg-[#0F172A]/90 text-[#00F3FF] border-[#00F3FF]/50 uppercase text-[8px] md:text-[9px] tracking-widest px-2.5 py-0.5 shadow-[0_0_8px_rgba(0,243,255,0.4)] font-black">
                           {cat.badgeTag}
                         </Badge>
                       )}
                       <Badge variant="glass" className="bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--foreground)]/10 uppercase text-[8px] md:text-[9px] tracking-widest px-3 md:px-4">
                          {cat.count} HARVESTS
                       </Badge>
                    </div>
                 </div>
                 <div className="space-y-2 md:space-y-4">
                    <div className="space-y-0.5 md:space-y-1">
                       <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tight uppercase group-hover:text-primary transition-colors italic">{cat.name}</h3>
                       <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] italic">Maritime Sector {cat.id} • Active</p>
                    </div>
                    <p className="text-[10px] md:text-xs text-text-secondary font-medium leading-tight md:leading-relaxed italic line-clamp-2">
                       {cat.desc}
                    </p>
                 </div>
                 <div className="flex items-center justify-between pt-3 md:pt-6 border-t border-[var(--foreground)]/5">
                    <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all italic">EXPLORE SECTOR</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-primary -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                 </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="py-8">
         <OceanReelsFeed />
      </div>

      {/* Discovery Hub Cta */}
      <Card className="p-[10px] md:p-12 lg:p-20 relative overflow-hidden bg-bg-secondary/40 border-[var(--foreground)]/5 group rounded-[24px] md:rounded-[48px]">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
            <div className="space-y-3 md:space-y-6 max-w-2xl text-center md:text-left">
               <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-[var(--foreground)] leading-none tracking-tighter uppercase italic">
                 Looking for a Specific <span className="text-primary italic">Species?</span>
               </h2>
               <p className="text-xs md:text-lg font-medium text-text-secondary leading-tight md:leading-relaxed italic">
                 Access the high-fidelity Global Discovery Engine for precise maritime sourcing.
               </p>
            </div>
            <Link href="/customer/search" className="w-full md:w-auto">
               <Button className="h-12 md:h-16 px-10 md:px-14 text-[9px] md:text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-3 md:gap-4 rounded-lg md:rounded-xl">
                  LAUNCH DISCOVERY <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
               </Button>
            </Link>
         </div>
      </Card>
    </div>
  
  );
}
