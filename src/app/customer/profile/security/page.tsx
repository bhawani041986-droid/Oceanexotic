"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldAlert, 
  Key, 
  Smartphone, 
  History, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  MapPin,
  Laptop
} from "lucide-react";

const LOGIN_HISTORY = [
  { id: "LOG-001", device: "Chrome on macOS", location: "San Francisco, US", time: "Active Now", current: true },
  { id: "LOG-002", device: "Safari on iPhone 15", location: "San Francisco, US", time: "14m ago", current: false },
  { id: "LOG-003", device: "Desktop App", location: "Tokyo, JP", time: "2d ago", current: false },
];

export default function CustomerSecurityPage() {
  return (

    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Security Sovereignty</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Governing Your Global Maritime Identity & Access Keys</p>
        </div>
        <Badge variant="success" className="h-10 px-6 text-[10px] font-black tracking-widest uppercase bg-success/10 text-success border-success/20">
          PROTECTION: OPTIMAL
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Governance Controls */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-10 space-y-10">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <Key className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Access Key Protocol</h3>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Current Access Key</label>
                    <Input type="password" placeholder="••••••••••••" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">New Access Key</label>
                       <Input type="password" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Confirm New Key</label>
                       <Input type="password" />
                    </div>
                 </div>
                 <Button className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple">COMMIT UPDATE</Button>
              </div>
           </Card>

           <Card className="p-10 space-y-10">
              <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                 <Smartphone className="w-5 h-5 text-primary" />
                 <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Multi-Factor Sovereignty</h3>
              </div>
              <div className="flex items-center justify-between p-6 rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10">
                 <div className="space-y-2">
                    <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">Two-Step Verification</p>
                    <p className="text-[10px] text-text-secondary font-medium leading-relaxed max-w-xs">
                      Requires a unique secondary directive sent to your mobile device for all login attempts.
                    </p>
                 </div>
                 <div className="w-14 h-8 bg-primary rounded-full relative p-1 cursor-pointer">
                    <div className="w-6 h-6 bg-white rounded-full translate-x-6" />
                 </div>
              </div>
           </Card>
        </div>

        {/* Identity Registry Sidepanel */}
        <aside className="lg:col-span-1 space-y-8">
           <Card className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                 <History className="w-4 h-4 text-primary" />
                 <h4 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Login Registry</h4>
              </div>
              <div className="space-y-6">
                 {LOGIN_HISTORY.map((log) => (
                    <div key={log.id} className="space-y-3 relative">
                       <div className="flex items-start gap-4">
                          <div className={`mt-1 w-8 h-8 rounded-[8px] flex items-center justify-center border ${log.current ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-text-secondary"}`}>
                             <Laptop className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-[var(--foreground)] tracking-tight">{log.device}</p>
                             <div className="flex items-center gap-2 text-[9px] font-medium text-text-secondary">
                                <MapPin className="w-3 h-3" /> {log.location}
                             </div>
                             <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{log.time}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="outline" className="w-full text-[9px] font-black uppercase tracking-widest text-danger border-danger/20 hover:bg-danger/10">TERMINATE ALL SESSIONS</Button>
           </Card>

           <Card className="p-8 bg-bg-secondary/40 space-y-4">
              <ShieldCheck className="w-8 h-8 text-success opacity-40 mx-auto" />
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Global Encryption</p>
                 <p className="text-[9px] text-text-secondary font-medium leading-relaxed italic">
                    All session data is governed by AES-256 maritime-grade encryption standards.
                 </p>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  
  );
}
