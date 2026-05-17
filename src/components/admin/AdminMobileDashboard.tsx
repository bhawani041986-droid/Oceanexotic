"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ArrowUpRight,
  Database,
  Lock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Users,
  ShieldAlert,
  AlertCircle,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export const AdminMobileDashboard = ({ stats, health, isLoading }: any) => {
  const router = useRouter();
  return (
    <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Tactical Header */}
      <div className="space-y-1 mb-8">
        <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase italic">Control Center</h2>
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Operational Readiness: 100%</p>
      </div>

      {/* 2. Metric Scroller - Floating Glass */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 scroll-smooth">
        {stats.map((stat: any, i: number) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex-shrink-0 w-[180px]"
          >
            <div className="p-6 rounded-[20px] bg-bg-card border border-[var(--foreground)]/5 shadow-2xl relative overflow-hidden group active:scale-95 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center text-primary border border-[var(--foreground)]/5 group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all">
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-success tracking-widest bg-success/10 px-2 py-1 rounded-full border border-success/20">
                  {stat.growth}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">{stat.label}</p>
                <h4 className="text-2xl font-black text-text-primary tracking-tighter">{stat.value}</h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. System Vitality - Command Node */}
      <div className="p-8 rounded-[24px] bg-bg-card border border-[var(--foreground)]/10 relative overflow-hidden shadow-2xl group active:scale-[0.98] transition-all">
        <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-32 h-32 text-primary" />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-text-primary tracking-widest italic">Infrastructure</h3>
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">Node Vitality Monitor</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 border border-success/20">
             <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-glow-purple" />
             <span className="text-[9px] font-black text-success uppercase tracking-widest">{health?.status || "OPERATIONAL"}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="p-5 rounded-[18px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3 hover:bg-[var(--foreground)]/10 transition-all">
            <div className="flex items-center gap-3 text-primary">
              <Server className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Uptime</span>
            </div>
            <p className="text-base font-black text-text-primary italic">{health?.uptime || "99.99%"}</p>
          </div>
          <div className="p-5 rounded-[18px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-3 hover:bg-[var(--foreground)]/10 transition-all">
            <div className="flex items-center gap-3 text-success">
              <Database className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Sync</span>
            </div>
            <p className="text-base font-black text-text-primary italic">{health?.database || "STABLE"}</p>
          </div>
        </div>
      </div>

      {/* 4. High-Priority Alert Node */}
      <div className="p-1 rounded-[24px] bg-danger/10 border border-danger/20 relative overflow-hidden group active:scale-[0.98] transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShieldAlert className="w-16 h-16 text-danger" />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-danger">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Critical Disruptions</span>
          </div>
          <div className="space-y-3">
             <div className="p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-between">
                <div className="space-y-0.5">
                   <p className="text-[12px] font-bold text-text-primary uppercase">Fraudulent Node Detected</p>
                   <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">ID: XR-992 | 0.8s ago</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-danger text-[var(--foreground)] text-[8px] font-black uppercase tracking-widest shadow-glow-danger">Neutralize</button>
             </div>
             <div className="p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-between">
                <div className="space-y-0.5">
                   <p className="text-[12px] font-bold text-text-primary uppercase">Pending High-Value Dispute</p>
                   <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic">₹48,250 | Waiting for Authority</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary opacity-40" />
             </div>
          </div>
        </div>
      </div>

      {/* 5. Sovereign Directives - Tactical Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.3em] italic">Directives</h3>
           <div className="h-px flex-1 bg-[var(--foreground)]/5 mx-6" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Approve Payouts", icon: <CreditCard className="w-5 h-5" />, color: "text-success", bg: "bg-success/10" },
            { label: "Verify Sellers", icon: <ShieldCheck className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10" },
            { label: "Audit Registry", icon: <Activity className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Marketplace Theme", icon: <Palette className="w-5 h-5" />, href: "/admin/marketplace/theme", color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Market Subscribers", icon: <Users className="w-5 h-5" />, href: "/admin/subscribers", color: "text-primary", bg: "bg-primary/10" },
            { label: "Manage Roles", icon: <Users className="w-5 h-5" />, color: "text-warning", bg: "bg-warning/10" },
          ].map((action: any) => (
            <button 
              key={action.label} 
              onClick={() => action.href && router.push(action.href)}
              className="p-6 rounded-[22px] bg-bg-card border border-[var(--foreground)]/5 flex flex-col items-center gap-4 active:scale-90 transition-all shadow-xl group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={cn("w-12 h-12 rounded-[16px] flex items-center justify-center border border-[var(--foreground)]/10 shadow-lg", action.bg, action.color)}>
                {action.icon}
              </div>
              <span className="text-[10px] font-black uppercase text-text-primary tracking-[0.1em] text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Live Activity - Audit Ledger */}
      <div className="p-8 rounded-[28px] bg-gradient-to-b from-bg-card to-bg-primary border border-[var(--foreground)]/10 shadow-2xl relative">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-text-primary uppercase tracking-widest italic">Live Activity</h3>
            <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">Real-time Audit Trail</p>
          </div>
          <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline active:scale-95 transition-all">Export Log</button>
        </div>
        <div className="space-y-8">
          {[
            { title: "Seller Node Onboarded", time: "2m ago", type: "MERCHANT", icon: <Store className="w-4 h-4" />, color: "text-primary" },
            { title: "Protocol Dispute Resolved", time: "12m ago", type: "SYSTEM", icon: <Scale className="w-4 h-4" />, color: "text-success" },
            { title: "Settlement Authorized", time: "24m ago", type: "FINTECH", icon: <TrendingUp className="w-4 h-4" />, color: "text-blue-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5 group relative">
              <div className={cn("w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center flex-shrink-0 group-active:scale-110 transition-all shadow-inner", item.color)}>
                {item.icon}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[13px] font-black text-text-primary tracking-tight uppercase italic">{item.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest">{item.type}</span>
                  <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/20" />
                  <span className="text-[8px] font-black text-text-secondary opacity-40 uppercase">{item.time}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-secondary opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
        
        <button className="w-full mt-12 h-14 rounded-[18px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary hover:bg-[var(--foreground)]/10 transition-all active:scale-[0.98]">
           View Complete Audit Ledger
        </button>
      </div>

    </div>
  );
};

import { cn } from "@/lib/utils";
import { Store, Scale } from "lucide-react";
