"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Settings, 
  Bell, 
  Globe, 
  Eye, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Save,
  MessageSquare,
  Droplets
} from "lucide-react";

export default function CustomerSettingsPage() {
  return (

    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Preference Governance</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Governing Your Global Platform Experience & Operational Directives</p>
        </div>
        <Button className="h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3">
          <Save className="w-4 h-4" /> COMMIT PREFERENCES
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          {[
            { label: "Notification Radar", icon: <Bell className="w-4 h-4" />, active: true },
            { label: "Interface & Region", icon: <Globe className="w-4 h-4" />, active: false },
            { label: "Sovereignty & Privacy", icon: <Eye className="w-4 h-4" />, active: false },
            { label: "Operational Alerts", icon: <Zap className="w-4 h-4" />, active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                item.active ? "bg-primary text-white shadow-glow-purple" : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-10">
           <Card className="p-10 space-y-10">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <Bell className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Notification Radar</h3>
              </div>
              <div className="space-y-8">
                 {[
                   { label: "Harvest Alerts", desc: "Real-time signals when saved species are listed.", icon: <Zap /> },
                   { label: "Order Fulfilment", desc: "Live tracking signals for your active commissions.", icon: <Droplets /> },
                   { label: "Market Intelligence", desc: "Daily bulletins on maritime trade trends.", icon: <MessageSquare /> },
                 ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between group">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">{toggle.label}</p>
                          <p className="text-[10px] text-text-secondary font-medium italic max-w-xs">{toggle.desc}</p>
                       </div>
                       <div className="w-12 h-7 bg-primary rounded-full relative p-1 cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full translate-x-5 shadow-sm" />
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-10 space-y-10">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <Globe className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Global directives</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Linguistic Hub</label>
                    <select defaultValue="English (Global)" className="w-full h-12 bg-bg-secondary border border-[var(--foreground)]/5 rounded-[14px] px-4 text-xs font-bold text-[var(--foreground)] outline-none focus:border-primary/40 transition-all">
                       <option>English (Global)</option>
                       <option>Japanese (Registry)</option>
                       <option>Norwegian (Arctic)</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Settlement Currency</label>
                    <select defaultValue="INR (₹)" className="w-full h-12 bg-bg-secondary border border-[var(--foreground)]/5 rounded-[14px] px-4 text-xs font-bold text-[var(--foreground)] outline-none focus:border-primary/40 transition-all">
                       <option>INR (₹)</option>
                       <option>USD ($)</option>
                       <option>EUR (€)</option>
                    </select>
                 </div>
              </div>
           </Card>

           <Card className="p-10 space-y-8 bg-bg-secondary/40 border border-[var(--foreground)]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                 <ShieldCheck className="w-12 h-12 text-success" />
              </div>
              <div className="space-y-4 relative z-10">
                 <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Data Sovereignty Protocol</h4>
                 <p className="text-[10px] text-text-secondary font-medium leading-relaxed italic max-w-sm">
                    Your operational preferences are stored using end-to-end maritime encryption. No data is shared with third-party logistics nodes without explicit authorization.
                 </p>
                 <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline">
                    VIEW PRIVACY CHARTER <ChevronRight className="w-3.5 h-3.5" />
                 </button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
