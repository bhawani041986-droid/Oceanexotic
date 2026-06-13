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

import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { MASTER_PRODUCT_REGISTRY } from "@/constants/products";

const CATEGORY_UI_MAPPING: Record<string, { desc: string, icon: string, color: string }> = {
  'FRESHWATER FISH': { icon: "🐟", color: "from-cyan-500/20", desc: "Freshwater river catch and aquaculture species." },
  'SEAWATER FISH': { icon: "🌊", color: "from-blue-500/20", desc: "Ocean and deep-sea harvests from the maritime sector." },
  'PRAWNS & SHRIMPS': { icon: "🍤", color: "from-orange-500/20", desc: "Premium prawns and shrimps sourced for global trade." },
  'CRABS & LOBSTERS': { icon: "🦀", color: "from-red-500/20", desc: "Elite mud crabs and lobsters from sustainable reefs." },
  'STEAKS & FILLETS': { icon: "🥩", color: "from-rose-500/20", desc: "Premium cuts, steaks, and fillets for culinary excellence." },
  'FROZEN': { icon: "❄️", color: "from-sky-500/20", desc: "Flash-frozen maritime assets preserving maximum freshness." },
  'DRY FISH': { icon: "🐡", color: "from-amber-500/20", desc: "Coastal dry fish and preserved delicacies." },
  'READY TO COOK': { icon: "🍳", color: "from-emerald-500/20", desc: "Marinated, prepped, and ready-to-cook selections." }
};

const CATEGORIES = PRODUCT_CATEGORIES.map(cat => ({
   id: cat.id,
   name: cat.label,
   count: MASTER_PRODUCT_REGISTRY.filter(p => p.category === cat.id).length,
   icon: CATEGORY_UI_MAPPING[cat.id]?.icon || "🐟",
   desc: CATEGORY_UI_MAPPING[cat.id]?.desc || "Premium maritime harvest.",
   color: CATEGORY_UI_MAPPING[cat.id]?.color || "from-blue-500/20"
}));

export default function CustomerCategoriesPage() {
  return (

    <div className="space-y-[10px] md:space-y-16 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-8 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-2 md:space-y-4 max-w-2xl">
          <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[8px] md:text-[10px]">GLOBAL TAXONOMY</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none italic">
            Explore the <span className="text-primary italic">Fleet.</span>
          </h1>
          <p className="text-[10px] md:text-sm font-medium text-text-secondary leading-tight md:leading-relaxed italic">
            Navigate the global maritime registry by species classification and sourcing sector.
          </p>
        </div>
        <div className="relative group w-full md:w-80">
          <input 
            placeholder="Search taxonomy..." 
            className="w-full h-12 md:h-14 pl-12 md:pl-14 pr-6 bg-bg-secondary border border-[var(--foreground)]/5 rounded-lg md:rounded-[20px] text-xs md:text-sm font-bold text-[var(--foreground)] focus:border-primary/50 transition-all outline-none italic"
          />
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] md:gap-10">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/customer/products?category=${cat.name}`}>
            <Card className={`p-[4px] md:p-1 group cursor-pointer transition-all hover:border-primary/40 bg-gradient-to-br ${cat.color} to-bg-secondary/40 border-[var(--foreground)]/5 rounded-[20px] md:rounded-[32px]`}>
              <div className="p-4 md:p-10 space-y-4 md:space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-2xl md:text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                       {cat.icon}
                    </div>
                    <Badge variant="glass" className="bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--foreground)]/10 uppercase text-[8px] md:text-[9px] tracking-widest px-3 md:px-4">
                       {cat.count} HARVESTS
                    </Badge>
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
