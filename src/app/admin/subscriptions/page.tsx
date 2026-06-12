"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  CreditCard, 
  Search, 
  Zap, 
  ShieldCheck, 
  Users, 
  BarChart3,
  Edit3,
  RefreshCcw,
  MoreVertical,
  Filter,
  IndianRupee
} from "lucide-react";

const SUBSCRIPTION_REGISTRY = [
  { id: "SUB-001", merchant: "Global Seafoods", tier: "ENTERPRISE", billing: "MONTHLY", status: "ACTIVE", renewal: "Jun 12, 2026", revenue: "₹2,400" },
  { id: "SUB-002", merchant: "Nordic Harvest", tier: "PREMIUM", billing: "ANNUAL", status: "ACTIVE", renewal: "May 24, 2027", revenue: "₹12,000" },
  { id: "SUB-003", merchant: "Pacific Fresh Co", tier: "FREE", billing: "NONE", status: "EXPIRED", renewal: "Expired", revenue: "₹0" },
  { id: "SUB-004", merchant: "Arctic Sourcing", tier: "ENTERPRISE", billing: "MONTHLY", status: "GRACE PERIOD", renewal: "Jun 02, 2026", revenue: "₹2,400" },
];

export default function AdminSubscriptionsPage() {
  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Tier Systemty</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Global Merchant SaaS Tiers & Billing Cycles</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <BarChart3 className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary shadow-glow-purple/5" /> YIELD ANALYTICS
           </Button>
           <Button variant="primary" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
             <Zap className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION NEW TIER
           </Button>
        </div>
      </div>

      {/* Subscription Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Enterprise Nodes", value: "42", icon: <ShieldCheck className="text-primary" /> },
          { label: "Premium Tiers", value: "158", icon: <Zap className="text-warning" /> },
          { label: "Active Subscribers", value: "624", icon: <Users className="text-success" /> },
          { label: "Monthly Yield", value: "₹124K", icon: <IndianRupee className="text-success" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-8 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all rounded-[24px] md:rounded-[40px] shadow-premium">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center shadow-glow-purple/5">
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 md:w-5 h-4 md:h-5" })}
            </div>
            <div className="space-y-0.5 md:space-y-1">
               <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
               <h4 className="text-xl md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      {/* Registry Table */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5 overflow-hidden">
        <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
           <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Subscription Registry</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Ledger of Platform Service Access</p>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
              <div className="relative group w-full md:w-80">
                 <Input placeholder="SEARCH MERCHANT..." className="h-10 md:h-12 pl-10 md:pl-12 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                 <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              </div>
              <Button variant="outline" size="sm" className="h-10 md:h-12 px-4 md:px-6 flex items-center gap-2 md:gap-3 text-[8px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
                 <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" /> FILTER
              </Button>
           </div>
        </div>
        <div className="hidden lg:block">
           <Table>
              <TableHeader>
                 <TableRow className="border-[var(--foreground)]/5">
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Merchant Hub</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Service Tier</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Billing Loop</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Revenue</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Service Status</TableHead>
                    <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Governance</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {SUBSCRIPTION_REGISTRY.map((sub) => (
                    <TableRow key={sub.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell>
                          <div className="space-y-0.5 md:space-y-1">
                             <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{sub.merchant}</p>
                             <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Renewal: {sub.renewal}</p>
                          </div>
                       </TableCell>
                       <TableCell>
                           <Badge variant={sub.tier === "ENTERPRISE" ? "default" : sub.tier === "PREMIUM" ? "warning" : "secondary"} className="shadow-glow-purple text-[7px] md:text-[8px] px-2 italic font-black uppercase">
                             {sub.tier}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{sub.billing}</TableCell>
                       <TableCell className="font-black text-[var(--foreground)] text-xs md:text-sm italic tracking-tighter">{sub.revenue}</TableCell>
                       <TableCell>
                          <Badge variant={
                             sub.status === "ACTIVE" ? "success" : 
                             sub.status === "GRACE PERIOD" ? "warning" : 
                             "secondary"
                          } className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest">
                             {sub.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right pr-4 md:pr-6">
                          <div className="flex justify-end gap-1 md:gap-2">
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                                <RefreshCcw className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                                <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                                <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4" />
                             </button>
                          </div>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </div>

        {/* Mobile card list */}
        <div className="lg:hidden space-y-3 p-4">
           {SUBSCRIPTION_REGISTRY.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                 <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                       <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{sub.merchant}</p>
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {sub.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                       <Badge variant={sub.tier === "ENTERPRISE" ? "default" : sub.tier === "PREMIUM" ? "warning" : "secondary"} className="shadow-glow-purple text-[7px] px-1.5 italic font-black uppercase">
                          {sub.tier}
                       </Badge>
                       <Badge variant={
                          sub.status === "ACTIVE" ? "success" : 
                          sub.status === "GRACE PERIOD" ? "warning" : 
                          "secondary"
                       } className="text-[7px] italic px-1.5 uppercase font-black tracking-widest">
                          {sub.status}
                       </Badge>
                    </div>
                 </div>
                 <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                    <div className="space-y-0">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Billing Loop</p>
                       <p className="text-xs font-black text-[var(--foreground)] italic">{sub.billing}</p>
                    </div>
                    <div className="space-y-0">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Revenue</p>
                       <p className="text-xs font-black text-primary italic">{sub.revenue}</p>
                    </div>
                    <div className="space-y-0">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Renewal</p>
                       <p className="text-[9px] font-black text-[var(--foreground)] opacity-80">{sub.renewal}</p>
                    </div>
                    <div className="flex gap-1">
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                          <RefreshCcw className="w-3.5 h-3.5" />
                       </button>
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                          <Edit3 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </Card>
    </div>
  
  );
}
