"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Trophy, 
  Star, 
  Zap, 
  Gift, 
  ChevronRight, 
  Clock,
  Gem,
  Award,
  Crown
} from "lucide-react";

const ACTIVE_PERKS = [
  { title: "Admiral's Discount", desc: "Permanent 5% discount on all premium harvests.", icon: <Zap />, active: true },
  { title: "Priority Docking", desc: "Your orders bypass standard fulfillment queues.", icon: <Clock />, active: true },
  { title: "Cold-Chain Waiver", desc: "Complimentary thermal logistics on orders over ₹15,000.", icon: <Star />, active: false },
];

export default function LoyaltyRewardsPage() {
  return (

    <div className="max-w-5xl mx-auto space-y-[10px] md:space-y-16 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      
      {/* Rank Visualization Hub */}
      <Card className="p-[10px] md:p-12 lg:p-20 relative overflow-hidden group bg-gradient-to-br from-purple-900/20 to-bg-secondary/40 border-purple-500/20 rounded-[20px] md:rounded-[48px]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 md:gap-16">
          <div className="relative">
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-purple-500/20 flex items-center justify-center p-3 md:p-4">
                <div className="w-full h-full rounded-full border-4 border-primary border-t-transparent animate-spin-slow" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <Crown className="w-8 h-8 md:w-12 md:h-12 text-primary shadow-glow-purple mb-1 md:mb-2" />
                   <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">PLATINUM RANK</p>
                </div>
             </div>
             <div className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 md:px-6 py-1 md:py-2 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple">
               LEVEL 42
             </div>
          </div>

          <div className="flex-1 space-y-4 md:space-y-8 text-center lg:text-left">
             <div className="space-y-2 md:space-y-4">
                <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[8px] md:text-[10px]">ELITE ADMIRAL REGISTRY</Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none italic">
                   Your Fleet <span className="text-primary italic">Legacy.</span>
                </h1>
                <p className="text-xs md:text-sm font-medium text-text-secondary leading-tight md:leading-relaxed max-w-xl mx-auto lg:mx-0 italic">
                   You are currently in the top 2% of the Global Oceanic Network. Accumulate 1,240 more Shells to reach Diamond Sovereignty.
                </p>
             </div>
             <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-8">
                <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">Available Shells</p>
                   <p className="text-xl md:text-3xl font-black text-[var(--foreground)] flex items-center justify-center lg:justify-start gap-2 md:gap-3 italic">
                     <Gem className="w-5 md:w-6 h-5 md:h-6 text-primary" /> 12,480
                   </p>
                </div>
                <div className="h-10 md:h-12 w-px bg-[var(--foreground)]/10 hidden sm:block" />
                <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">Global Influence</p>
                   <p className="text-xl md:text-3xl font-black text-[var(--foreground)] flex items-center justify-center lg:justify-start gap-2 md:gap-3 italic">
                     <Award className="w-5 md:w-6 h-5 md:h-6 text-success" /> TOP 2%
                   </p>
                </div>
             </div>
          </div>
        </div>
      </Card>

      {/* Perks Registry */}
      <section className="space-y-[4px] md:space-y-8">
         <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
               <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tight uppercase italic">Active Harvest Perks</h3>
               <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Permanent benefits linked to your Admiral Rank</p>
            </div>
            <Button variant="ghost" className="text-[8px] md:text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 flex items-center gap-2 md:gap-3 h-8 md:h-10">
               REPOSITORY <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-8">
            {ACTIVE_PERKS.map((perk) => (
               <Card key={perk.title} className={`p-[10px] md:p-10 space-y-[10px] md:space-y-8 group transition-all rounded-[20px] md:rounded-[32px] ${perk.active ? "border-primary/20 bg-primary/5 shadow-glow-purple/5" : "opacity-50 grayscale"}`}>
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[18px] flex items-center justify-center border transition-all ${perk.active ? "bg-primary/20 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-text-secondary"}`}>
                     {React.cloneElement(perk.icon as React.ReactElement, { className: "w-5 md:w-6 h-5 md:h-6" })}
                  </div>
                  <div className="space-y-3 md:space-y-4">
                     <div className="space-y-0.5 md:space-y-1">
                        <h4 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tight italic">{perk.title}</h4>
                        <p className="text-[9px] md:text-[10px] text-text-secondary font-medium leading-tight italic">{perk.desc}</p>
                     </div>
                     <Badge variant={perk.active ? "success" : "secondary"} className="uppercase text-[7px] md:text-[8px] tracking-[0.2em] px-2 md:px-3">
                        {perk.active ? "ACTIVE PROTOCOL" : "LOCKED"}
                     </Badge>
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* Pearl Accrual Ledger */}
      <Card className="p-[10px] md:p-10 bg-bg-secondary/40 border-[var(--foreground)]/5 space-y-[10px] md:space-y-10 rounded-[20px] md:rounded-[40px]">
         <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--foreground)]/5 pb-[10px] md:pb-8 gap-2">
            <div className="space-y-1">
               <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tight uppercase italic">Shell Ledger</h3>
               <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Chronological record of reward commissions</p>
            </div>
            <div className="flex items-center gap-2">
               <Trophy className="w-4 md:w-5 h-4 md:h-5 text-warning" />
               <span className="text-[9px] md:text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest italic">LIFETIME SHELLS: 84,200</span>
            </div>
         </div>
         <div className="space-y-[4px] md:space-y-4">
            {[
               { action: "Settlement: Premium King Lobster", points: "+840 Shells", date: "May 09, 2026" },
               { action: "Redemption: Phoenix Bay Waiver", points: "-500 Shells", date: "May 04, 2026" },
               { action: "Fleet Multiplier (Admiral x1.5)", points: "+240 Shells", date: "May 01, 2026" },
               { action: "Welcome to Admiral Registry", points: "+1,000 Shells", date: "Apr 28, 2026" },
            ].map((entry, i) => (
               <div key={i} className="flex items-center justify-between p-3 md:p-6 rounded-xl md:rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:border-[var(--foreground)]/20 transition-all cursor-default">
                  <div className="space-y-0.5 md:space-y-1">
                     <p className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tight italic">{entry.action}</p>
                     <p className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic">{entry.date}</p>
                  </div>
                  <p className={`text-xs md:text-sm font-black uppercase italic ${entry.points.startsWith("+") ? "text-success" : "text-danger"}`}>
                     {entry.points}
                  </p>
               </div>
            ))}
         </div>
      </Card>

    </div>
  
  );
}
