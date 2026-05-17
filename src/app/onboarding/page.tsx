"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Compass, 
  Ship, 
  ShieldCheck, 
  ArrowRight, 
  Waves, 
  Globe,
  Anchor,
  User,
  Zap,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

const ROLES = [
  {
    title: "Navigator",
    desc: "Premium seafood exploration and procurement.",
    icon: <Compass className="w-8 h-8" />,
    color: "primary",
    benefit: "Priority Harvesting",
    href: "/customer"
  },
  {
    title: "Merchant",
    desc: "Global maritime trade and harvest distribution.",
    icon: <Ship className="w-8 h-8" />,
    color: "success",
    benefit: "Fleet Sovereignty",
    href: "/seller/onboarding"
  },
  {
    title: "Admiral",
    desc: "System governance and macro-trade monitoring.",
    icon: <ShieldCheck className="w-8 h-8" />,
    color: "purple-500",
    benefit: "Total Authority",
    href: "/admin/dashboard"
  }
];

export default function OnboardingPage() {
  return (

    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.05),transparent_70%)]" />
      <div className="absolute top-0 right-0 p-20 opacity-5">
         <Waves className="w-96 h-96 text-primary" />
      </div>

      <div className="max-w-6xl w-full space-y-16 relative z-10 py-20">
         <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4">
               <div className="w-12 h-12 bg-primary rounded-[12px] rotate-45 shadow-glow-purple" />
               <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase">OceanExotic Global</h1>
            </div>
            <h2 className="text-5xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">Commission Your <span className="text-primary text-glow-purple">Identity.</span></h2>
            <p className="text-lg font-medium text-text-secondary italic leading-relaxed">
               Welcome to the global maritime registry. Select your directive to begin commissioning your presence within the OceanExotic Global network.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {ROLES.map((role) => (
              <Card key={role.title} className="p-10 flex flex-col justify-between space-y-12 bg-bg-secondary/40 hover:border-primary/40 transition-all group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                 
                 <div className="space-y-8 relative z-10">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                       {role.icon}
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">{role.title}</h3>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5" /> {role.benefit}
                       </p>
                       <p className="text-sm text-text-secondary font-medium leading-relaxed italic">
                          {role.desc}
                       </p>
                    </div>
                 </div>

                 <Link href={role.href} className="relative z-10">
                    <Button className="w-full h-16 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-4 group/btn">
                       ESTABLISH NODE <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                 </Link>
              </Card>
            ))}
         </div>

         <div className="pt-10 border-t border-[var(--foreground)]/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-10">
               <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                  <Anchor className="w-4 h-4 text-primary" /> SECURE HANDSHAKE
               </div>
               <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                  <Globe className="w-4 h-4 text-primary" /> GLOBAL REGISTRY
               </div>
               <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4 text-primary" /> TRADE VELOCITY
               </div>
            </div>
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.4em] opacity-40">Unauthorized Identity Theft is Federally Monitored</p>
         </div>
      </div>
    </div>
  
  );
}
