// @ts-nocheck
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
  Palette,
  Store, 
  Scale
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const AdminMobileDashboard = ({ stats, health, isLoading }: any) => {
  const router = useRouter();
  
  // Extract primary metric (e.g. Global Liquidity) and secondary metrics
  const primaryStat = stats && stats.length > 0 ? stats[0] : { label: "Global Liquidity", value: "₹0", growth: "+0%", icon: <Globe /> };
  const secondaryStats = stats && stats.length > 1 ? stats.slice(1) : [];

  return (
    <div className="space-y-6 pb-20 px-2 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Tactical Header (Compact) */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-text-primary tracking-tighter uppercase italic">Command Center</h2>
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">Operational Readiness: 100%</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 shadow-glow-purple">
           <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
           <span className="text-[8px] font-black text-success uppercase tracking-widest">{health?.status || "SECURE"}</span>
        </div>
      </div>

      {/* 2. High-Density KPI Grid */}
      <div className="space-y-3 px-2">
        {/* Hero Metric */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[20px] bg-bg-card/60 backdrop-blur-xl border border-[var(--foreground)]/5 shadow-2xl relative overflow-hidden group active:scale-[0.98] transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-glow-purple">
              {primaryStat.icon}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-success tracking-widest bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
              {primaryStat.growth}
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{primaryStat.label}</p>
            <h4 className="text-3xl font-black text-[var(--foreground)] tracking-tighter italic shadow-sm">{primaryStat.value}</h4>
          </div>
        </motion.div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {secondaryStats.slice(0, 2).map((stat: any, i: number) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (i * 0.1) }}
              className="p-4 rounded-[16px] bg-bg-card/60 backdrop-blur-xl border border-[var(--foreground)]/5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-primary opacity-80">{React.cloneElement(stat.icon as React.ReactElement, { className: "w-5 h-5" })}</div>
                <span className="text-[8px] font-black text-success tracking-widest">{stat.growth}</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-lg font-black text-[var(--foreground)] tracking-tighter">{stat.value}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Directives - Quick Action Grid (Moved UP for priority access) */}
      <div className="space-y-4 px-2 mt-2">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] italic">Directives</h3>
           <div className="h-px flex-1 bg-[var(--foreground)]/5 mx-4" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Theme", icon: <Palette className="w-5 h-5" />, href: "/admin/marketplace/theme", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
            { label: "Verify", icon: <ShieldCheck className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { label: "Payouts", icon: <CreditCard className="w-5 h-5" />, color: "text-success", bg: "bg-success/10 border-success/20" },
            { label: "Users", icon: <Users className="w-5 h-5" />, href: "/admin/subscribers", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
            { label: "Roles", icon: <Lock className="w-5 h-5" />, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
            { label: "Audit", icon: <Activity className="w-5 h-5" />, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
          ].map((action: any) => (
            <button 
              key={action.label} 
              onClick={() => action.href && router.push(action.href)}
              className="p-4 rounded-[18px] bg-bg-card/40 border border-[var(--foreground)]/5 flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg overflow-hidden relative backdrop-blur-sm"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", action.bg, action.color)}>
                {action.icon}
              </div>
              <span className="text-[8px] font-black uppercase text-text-primary tracking-widest text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Split Node: System Vitality & High Priority Alerts */}
      <div className="px-2">
        <div className="flex flex-col gap-3">
          {/* Active Alert Widget */}
          <div className="p-4 rounded-[16px] bg-danger/10 border border-danger/20 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center border border-danger/30">
                <AlertCircle className="w-4 h-4 text-danger animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-danger uppercase tracking-widest italic">1 Critical Alert</p>
                <p className="text-[8px] font-bold text-text-secondary uppercase">Fraudulent Node XR-992</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-md bg-danger text-[var(--foreground)] text-[7px] font-black uppercase tracking-widest shadow-glow-danger">Resolve</button>
          </div>
          
          {/* System Health Compact */}
          <div className="p-4 rounded-[16px] bg-bg-card/60 backdrop-blur-md border border-[var(--foreground)]/5 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1.5">
              <Server className="w-4 h-4 text-primary opacity-80" />
              <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Uptime</p>
              <p className="text-[11px] font-black text-[var(--foreground)]">{health?.uptime || "99.9%"}</p>
            </div>
            <div className="w-px h-8 bg-[var(--foreground)]/10" />
            <div className="flex flex-col items-center gap-1.5">
              <Database className="w-4 h-4 text-success opacity-80" />
              <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Sync</p>
              <p className="text-[11px] font-black text-[var(--foreground)]">{health?.database || "STABLE"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live Ledger - Compacted */}
      <div className="px-2">
        <div className="p-5 rounded-[20px] bg-gradient-to-b from-bg-card/80 to-bg-primary/10 backdrop-blur-xl border border-[var(--foreground)]/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest italic">Live Ledger</h3>
            <button className="text-[8px] font-black text-primary uppercase tracking-widest opacity-80 active:opacity-100">Export</button>
          </div>
          <div className="space-y-5">
            {[
              { title: "Seller Onboarded", time: "2m", type: "MRCH", icon: <Store className="w-3 h-3" />, color: "text-primary" },
              { title: "Dispute Resolved", time: "12m", type: "SYS", icon: <Scale className="w-3 h-3" />, color: "text-success" },
              { title: "Payout Auth", time: "24m", type: "FIN", icon: <TrendingUp className="w-3 h-3" />, color: "text-amber-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={cn("w-8 h-8 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center shadow-inner", item.color)}>
                  {item.icon}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-[var(--foreground)] uppercase italic">{item.title}</p>
                    <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest">{item.type}</p>
                  </div>
                  <span className="text-[8px] font-black text-text-secondary opacity-50 uppercase">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
