"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Settings, 
  Globe, 
  Bell, 
  Lock, 
  Cpu, 
  Save, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Store,
  DollarSign
} from "lucide-react";

export default function SellerSettingsPage() {
  return (

    <div className="space-y-8 lg:space-y-12 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[10px] lg:gap-6 lg:border-b lg:border-[var(--foreground)]/5 lg:pb-10">
        <div className="space-y-1 text-center lg:text-left">
          <h2 className="text-xl lg:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Sovereign Directives</h2>
          <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Your Merchant Hub Preferences & Node Calibration</p>
        </div>
        <Button className="hidden lg:flex h-10 lg:h-12 lg:px-10 text-[9px] lg:text-[10px] font-black tracking-widest uppercase shadow-glow-purple items-center gap-3 rounded-lg italic">
          <Save className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMIT DIRECTIVES
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Navigation Sidebar (Mobile: Horizontal Scroll or Grid) */}
        <aside className="lg:col-span-1 flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto pb-4 lg:pb-0 no-scrollbar px-1">
          {[
            { label: "Merchant Identity", icon: <Store className="w-4 h-4" />, active: true },
            { label: "Regional Reach", icon: <Globe className="w-4 h-4" />, active: false },
            { label: "Financial Node", icon: <DollarSign className="w-4 h-4" />, active: false },
            { label: "Alert Nodes", icon: <Bell className="w-4 h-4" />, active: false },
            { label: "Security & Keys", icon: <Lock className="w-4 h-4" />, active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={`flex-shrink-0 flex items-center gap-4 px-5 py-3.5 lg:py-4 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 italic ${
                item.active ? "bg-primary text-white shadow-glow-purple/20" : "text-text-secondary hover:text-white hover:bg-white/5 opacity-40 hover:opacity-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8 lg:space-y-10">
            <Card className="p-[10px] lg:p-6 space-y-6 lg:space-y-8 rounded-[24px] lg:rounded-[40px] bg-bg-secondary/10 border-[var(--foreground)]/5 shadow-premium">
               <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                  <Store className="w-4 h-4 text-primary opacity-40" />
                  <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Merchant Identity</h3>
               </div>
               <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Hub Name</label>
                        <Input defaultValue="Global Seafoods Alpha" className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Merchant ID</label>
                        <Input readOnly value="MSH-9982-ALPHA" className="h-10 md:h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg italic text-[11px] md:text-sm font-black tracking-tighter opacity-40" />
                     </div>
                     <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[8px] md:text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1 italic opacity-40">Node Biography</label>
                        <textarea className="w-full h-20 md:h-28 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-lg p-3 md:p-4 text-[10px] md:text-xs text-text-secondary font-black italic tracking-widest leading-relaxed focus:border-primary/30 transition-all outline-none opacity-60" defaultValue="Premium maritime sourcing since 1994. North Atlantic specialist with cold-chain verified logistics." />
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="p-[10px] lg:p-6 space-y-6 lg:space-y-8 rounded-[24px] lg:rounded-[40px] bg-bg-secondary/10 border-[var(--foreground)]/5 shadow-premium">
               <div className="flex items-center gap-3 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
                  <Globe className="w-4 h-4 text-primary opacity-40" />
                  <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Regional Calibration</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-[24px] bg-white/[0.02] border border-[var(--foreground)]/5 hover:bg-white/[0.04] transition-all cursor-pointer">
                     <div className="space-y-0.5">
                        <p className="text-[11px] md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Multi-Currency Yields</p>
                        <p className="text-[7px] md:text-[9px] text-text-secondary font-black italic uppercase tracking-widest opacity-40">Accept global maritime currencies</p>
                     </div>
                     <div className="w-10 h-6 bg-primary rounded-full relative p-1 transition-all">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-[24px] bg-white/[0.02] border border-[var(--foreground)]/5 opacity-20 hover:opacity-100 transition-all cursor-pointer">
                     <div className="space-y-0.5">
                        <p className="text-[11px] md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Global Signal Alerts</p>
                        <p className="text-[7px] md:text-[9px] text-text-secondary font-black italic uppercase tracking-widest">Real-time trade signals</p>
                     </div>
                     <div className="w-10 h-6 bg-[var(--foreground)]/10 rounded-full relative p-1 transition-all">
                        <div className="w-4 h-4 bg-[var(--foreground)]/20 rounded-full" />
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="p-4 md:p-5 bg-success/5 border border-success/10 flex flex-col sm:flex-row items-center justify-between gap-6 group rounded-[20px] md:rounded-[32px] shadow-glow-purple/5">
               <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-[14px] bg-success/10 border border-success/20 flex items-center justify-center text-success shadow-glow-purple/20 shrink-0">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                     <h4 className="text-[11px] md:text-sm font-black text-[var(--foreground)] uppercase tracking-tighter italic">Identity Hardened</h4>
                     <p className="text-[7px] md:text-[9px] text-text-secondary font-black italic leading-relaxed uppercase tracking-widest opacity-40">
                        Protected via global biometric handshakes and Level-3 encryption sovereignty.
                     </p>
                  </div>
               </div>
               <Badge variant="success" className="h-6 md:h-7 px-4 text-[7px] md:text-[8px] font-black tracking-widest uppercase shrink-0 italic">SECURE</Badge>
            </Card>

            {/* Mobile Sticky Save Button */}
            <div className="lg:hidden fixed bottom-24 left-0 right-0 px-4 z-50">
              <Button className="w-full h-11 text-[10px] font-black tracking-widest uppercase shadow-glow-purple rounded-lg italic">
                COMMIT ALL DIRECTIVES
              </Button>
            </div>
        </div>
      </div>
    </div>
  
  );
}
