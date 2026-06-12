"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Cpu, 
  Zap, 
  Activity, 
  Terminal, 
  History, 
  ShieldCheck, 
  Waves, 
  Lock,
  ChevronRight,
  Database,
  CloudLightning
} from "lucide-react";

const SYSTEM_LOGS = [
  { id: "LOG-9921", event: "Cold-Chain Signal Synchronized", node: "North Atlantic-1", time: "12m ago", status: "STABLE" },
  { id: "LOG-9920", event: "Global Trade Registry Handshake", node: "Hub Alpha", time: "1h ago", status: "OPTIMAL" },
  { id: "LOG-9919", event: "Merchant API Key Rotation", node: "Identity Vault", time: "4h ago", status: "SECURE" },
  { id: "LOG-9918", event: "Large Harvest Metadata Commit", node: "Registry-7", time: "8h ago", status: "SUCCESS" },
];

export default function SellerSystemPage() {
  return (

    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--foreground)]/5 pb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Node Integrity</h2>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Live Technical Monitoring of your Merchant Sourcing Hub</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black tracking-widest uppercase">
              <Activity className="w-4 h-4" /> HUB ONLINE
           </div>
        </div>
      </div>

      {/* Technical Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "API Uptime", value: "99.98%", intensity: 99, icon: <Zap /> },
          { label: "Sync Latency", value: "14ms", intensity: 94, icon: <CloudLightning /> },
          { label: "Data Integrity", value: "100%", intensity: 100, icon: <ShieldCheck /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-8 space-y-6 bg-bg-secondary/40 border-[var(--foreground)]/5 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
               <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  {React.cloneElement(stat.icon as React.ReactElement, { className: "w-6 h-6" })}
               </div>
               <Badge variant="glass" className="h-6 px-3 text-[8px] font-black tracking-widest">REAL-TIME</Badge>
            </div>
            <div className="space-y-4 relative z-10">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{stat.label}</p>
                  <h4 className="text-3xl font-black text-[var(--foreground)]">{stat.value}</h4>
               </div>
               <div className="h-1.5 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-glow-purple transition-all duration-1000" style={{ width: `${stat.intensity}%` }} />
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Live Technical Ledger */}
         <Card className="lg:col-span-2 p-10 space-y-10">
            <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-8">
               <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Hub Signal Log</h3>
               </div>
               <Button variant="outline" size="sm" className="h-10 px-6 text-[9px] font-black uppercase tracking-widest border-[var(--foreground)]/5">FILTER LOGS</Button>
            </div>
            
            <div className="space-y-6">
               {SYSTEM_LOGS.map((log) => (
                 <div key={log.id} className="flex items-center justify-between p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-10 h-10 rounded-[14px] bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                          <History className="w-5 h-5" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-[var(--foreground)] tracking-tight uppercase">{log.event}</p>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] italic">Node: {log.node}</p>
                       </div>
                    </div>
                    <div className="text-right space-y-1">
                       <Badge variant="glass" className="text-primary border-primary/20 bg-primary/5 text-[7px]">{log.status}</Badge>
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1">{log.time}</p>
                    </div>
                 </div>
               ))}
            </div>
            
            <button className="w-full text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] hover:text-[var(--foreground)] transition-all flex items-center justify-center gap-2">
               VIEW FULL TECHNICAL HISTORY <ChevronRight className="w-4 h-4" />
            </button>
         </Card>

         {/* Technical Node Details */}
         <div className="space-y-8">
            <Card className="p-10 space-y-8 bg-bg-secondary/40">
               <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Registry Sync</h3>
               </div>
               <div className="space-y-6">
                  <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-4">
                     <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Global Master Node</p>
                     <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                        <p className="text-xs font-medium text-text-secondary">EST-88214-ALPHA</p>
                     </div>
                  </div>
                  <div className="p-6 rounded-[24px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 space-y-4">
                     <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Last Metadata Commit</p>
                     <div className="flex items-center gap-4 text-xs font-medium text-text-secondary italic">
                        <Clock className="w-4 h-4" /> 14 seconds ago
                     </div>
                  </div>
               </div>
               <Button className="w-full h-14 text-[10px] font-black tracking-widest uppercase shadow-glow-purple">
                  FORCE MANUAL SYNC
               </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 space-y-4">
               <div className="flex items-center gap-4">
                  <Cpu className="w-5 h-5 text-primary shadow-glow-purple" />
                  <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Encryption Systemty</p>
               </div>
               <p className="text-[9px] text-text-secondary font-medium leading-relaxed italic">
                 Your merchant node is commissioning technical handshakes via Level-3 Maritime Security Protocols. System health is optimal.
               </p>
            </Card>
         </div>
      </div>

    </div>
  
  );
}

function Clock(props: any) {
  return (

    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  
  );
}
