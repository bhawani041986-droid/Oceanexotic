"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Scale, 
  Search, 
  AlertCircle, 
  MessageSquare, 
  ChevronRight, 
  Gavel,
  ShieldAlert,
  ArrowUpRight,
  Filter
} from "lucide-react";

const DISPUTE_REGISTRY = [
  { id: "DISP-001", order: "#ORD-9982", claimant: "Admiral John", merchant: "Global Seafoods", type: "QUALITY CLAIM", status: "UNDER REVIEW", intensity: "HIGH" },
  { id: "DISP-002", order: "#ORD-9975", claimant: "Alice T.", merchant: "Nordic Harvest", type: "DELIVERY DELAY", status: "PENDING", intensity: "MEDIUM" },
  { id: "DISP-003", order: "#ORD-9960", claimant: "Sector-7 Hub", merchant: "Arctic Sourcing", type: "COLD-CHAIN BREACH", status: "ESCALATED", intensity: "CRITICAL" },
];

export default function AdminDisputesPage() {
  return (

    <>
      <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Mediation Command</h2>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Global Order Disputes & Settlement Arbitrations</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
             <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg italic">
                <Scale className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" /> ARBITRATION RULES
             </Button>
             <Button variant="primary" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg italic">
               <Gavel className="w-3.5 md:w-4 h-3.5 md:h-4" /> INITIATE RESOLUTION
             </Button>
          </div>
        </div>

        {/* Dispute Pulse */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
          {[
            { label: "Active Disputes", value: "14", icon: <AlertCircle className="text-warning" /> },
            { label: "Resolved (24h)", value: "8", icon: <ShieldAlert className="text-success" /> },
            { label: "Avg. Resolution", value: "4.2h", icon: <MessageSquare className="text-primary" /> },
            { label: "Sovereign Escalate", value: "2", icon: <Gavel className="text-danger" /> },
          ].map((stat) => (
            <Card key={stat.label} className="p-[10px] md:p-6 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all rounded-[24px] md:rounded-[40px] shadow-premium">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center shadow-glow-purple/5">
                {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
              </div>
              <div className="space-y-0.5 md:space-y-1">
                 <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
                 <h4 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
              </div>
            </Card>
          ))}
        </div>

        {/* Registry Table */}
        <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
          <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
             <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Mediation Registry</h3>
                <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Monitoring of Fleet Conflict Signals</p>
             </div>
             <div className="relative group w-full md:w-64">
                <Input placeholder="SEARCH DISPUTE..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
             </div>
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <Table>
               <TableHeader>
                  <TableRow className="border-[var(--foreground)]/5">
                     <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Conflict Identity</TableHead>
                     <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Order</TableHead>
                     <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Claimant / Merchant</TableHead>
                     <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Intensity</TableHead>
                     <TableHead className="text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Status</TableHead>
                     <TableHead className="text-right text-[9px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {DISPUTE_REGISTRY.map((disp) => (
                     <TableRow key={disp.id} className="group border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                        <TableCell>
                           <div className="space-y-0.5 md:space-y-1">
                              <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic">{disp.type}</p>
                              <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {disp.id}</p>
                           </div>
                        </TableCell>
                        <TableCell className="font-black text-primary text-[9px] md:text-[10px] italic">{disp.order}</TableCell>
                        <TableCell>
                           <div className="space-y-0.5 md:space-y-1">
                              <p className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-tighter italic">{disp.claimant}</p>
                              <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">vs {disp.merchant}</p>
                           </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={disp.intensity === "CRITICAL" ? "danger" : disp.intensity === "HIGH" ? "warning" : "secondary"} className="uppercase text-[8px] md:text-[10px] italic px-2">
                              {disp.intensity}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] md:text-[8px] tracking-[0.2em] italic">
                              {disp.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <button className="p-2 md:p-3 rounded-lg hover:bg-[var(--foreground)]/5 text-primary transition-all flex items-center justify-end gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic border border-[var(--foreground)]/5">
                              MEDIATE <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
                           </button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="lg:hidden space-y-3 p-4">
            {DISPUTE_REGISTRY.map((disp) => (
              <div key={disp.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{disp.type}</p>
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{disp.id} • {disp.order}</p>
                  </div>
                  <Badge variant={disp.intensity === "CRITICAL" ? "danger" : disp.intensity === "HIGH" ? "warning" : "secondary"} className="uppercase text-[8px] italic px-2">{disp.intensity}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-[var(--foreground)]/5 space-y-1">
                  <p className="text-[9px] font-black text-[var(--foreground)] uppercase italic">{disp.claimant} <span className="text-text-secondary opacity-60">vs {disp.merchant}</span></p>
                  <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] tracking-[0.2em] italic">{disp.status}</Badge>
                </div>
                <button className="w-full p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-primary transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest italic">
                  MEDIATE <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  
  );
}
