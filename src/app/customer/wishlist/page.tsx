"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Star,
  Search
} from "lucide-react";
import Link from "next/link";

const WISHLIST_ITEMS = [
  { id: "1", name: "Andaman Mud Crab", category: "Premium Crustacean", price: 3800, rating: 4.9, seller: "Phoenix Bay Harvest", fresh: true, tag: "FRESH CATCH" },
  { id: "2", name: "Swaraj Dweep Tiger Prawns", category: "Andaman Shellfish", price: 2400, rating: 4.8, seller: "Havelock Dock No.3", fresh: true, tag: "JUMBO" },
];

export default function WishlistPage() {
  return (

    <div className="max-w-5xl mx-auto space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Curated Registry</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Managing Your Personalized Maritime Collection</p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
           <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">{WISHLIST_ITEMS.length} SAVED ASSETS</p>
           <Button variant="primary" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl">
             <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMISSION ALL
           </Button>
        </div>
      </div>

      {/* Wishlist Grid */}
      {WISHLIST_ITEMS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-8">
          {WISHLIST_ITEMS.map((item) => (
            <Card key={item.id} className="p-[4px] md:p-1 group overflow-hidden transition-all hover:border-primary/30 rounded-[20px] md:rounded-[32px]">
              <div className="relative aspect-[16/9] rounded-[16px] md:rounded-[28px] overflow-hidden bg-bg-secondary">
                 <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent opacity-60" />
                 <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
                    <Badge variant="default" className="shadow-glow-purple text-[8px] md:text-[10px]">{item.tag}</Badge>
                    {item.fresh && <Badge variant="success" className="bg-success/80 backdrop-blur-md uppercase text-[7px] md:text-[8px]">COLD-CHAIN ACTIVE</Badge>}
                 </div>
                 <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
                    <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary hover:bg-danger hover:text-white transition-all">
                       <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    </button>
                 </div>
                 <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 z-10 flex justify-between items-end">
                    <div className="space-y-0.5 md:space-y-1">
                       <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</p>
                       <h4 className="text-base md:text-xl font-bold text-[var(--foreground)] tracking-tight italic">{item.name}</h4>
                    </div>
                    <p className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">₹{item.price.toLocaleString()}</p>
                 </div>
              </div>
              <div className="p-3 md:p-8 space-y-4 md:space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                       <div className="flex text-primary text-[8px] md:text-[10px]">★★★★★</div>
                       <span className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">4.9 RANK</span>
                    </div>
                    <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic">via {item.seller}</p>
                 </div>
                 <div className="flex gap-[4px] md:gap-4">
                    <Button variant="primary" className="flex-1 h-10 md:h-14 text-[9px] md:text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl">
                       <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMISSION NOW
                    </Button>
                    <button className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-all text-text-secondary hover:text-[var(--foreground)] group">
                       <Search className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                    </button>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-8">
           <div className="w-24 h-24 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center mx-auto text-text-secondary opacity-40">
              <Heart className="w-10 h-10" />
           </div>
           <div className="space-y-4">
              <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tight">Curated Registry Empty</h3>
              <p className="text-sm font-medium text-text-secondary max-w-sm mx-auto leading-relaxed italic">
                 Explore the global maritime marketplace and save harvests to your personalized registry.
              </p>
           </div>
           <Link href="/customer/products">
              <Button className="h-14 px-12 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-4">
                 EXPLORE HARVESTS <ArrowRight className="w-4 h-4" />
              </Button>
           </Link>
        </div>
      )}

      {/* Trust Badge */}
      <Card className="p-[10px] md:p-10 bg-bg-secondary/40 border border-[var(--foreground)]/5 flex items-center gap-[10px] md:gap-8 rounded-[20px] md:rounded-[40px]">
         <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[18px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5 md:w-7 md:h-7" />
         </div>
         <div className="space-y-0.5 md:space-y-1">
            <h4 className="text-xs md:text-sm font-bold text-[var(--foreground)] uppercase tracking-tight italic">Immutability Protocol</h4>
            <p className="text-[10px] md:text-xs text-text-secondary font-medium leading-relaxed italic">
               Saved harvests are monitored for availability. Pricing is governed by the live maritime settlement registry at the time of commissioning.
            </p>
         </div>
      </Card>
    </div>
  
  );
}
