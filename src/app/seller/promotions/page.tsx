"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  Zap, 
  Plus, 
  Gift, 
  TrendingUp, 
  Clock, 
  Eye, 
  Edit3, 
  Trash2,
  Tag,
  BarChart2,
  Percent,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROMOTIONS = [
  { id: "PRM-4421", title: "Midnight Harvest Sale", code: "MIDNIGHT15", discount: "15%", usage: "124/500", status: "ACTIVE", end: "24h left" },
  { id: "PRM-4422", title: "Oceanic Bundle", code: "FLEET25", discount: "25%", usage: "42/100", status: "SCHEDULED", end: "Starts 2d" },
  { id: "PRM-4423", title: "Saku Special", code: "SAKU10", discount: "10%", usage: "500/500", status: "EXPIRED", end: "Ended" },
];

export default function SellerPromotionsPage() {
  return (

    <div className="space-y-8 lg:space-y-12 animate-fade-in pb-32 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[10px] lg:gap-6 lg:border-b lg:border-[var(--foreground)]/5 lg:pb-10">
        <div className="space-y-1 text-center lg:text-left">
          <h2 className="text-xl lg:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Incentive Command</h2>
          <p className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Commissioning Global Trade Discounts & Fleet Rewards Sovereignty</p>
        </div>
        <Button className="w-full lg:w-auto h-10 lg:h-12 lg:px-10 text-[9px] lg:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-3 rounded-lg italic">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> COMMISSION INCENTIVE
        </Button>
      </div>

      {/* Promotion Pulse */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[10px] lg:gap-6">
        {[
          { label: "Active Nodes", value: "12", change: "+2 this week", icon: <Zap className="text-primary" /> },
          { label: "Trade Yield", value: "₹4.2L", change: "via incentives", icon: <TrendingUp className="text-success" /> },
          { label: "Fleet Reach", value: "842", change: "Unique Admirals", icon: <Gift className="text-purple-500" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] lg:p-6 space-y-3 lg:space-y-5 bg-bg-secondary/10 border-[var(--foreground)]/5 relative overflow-hidden group rounded-[20px] lg:rounded-[32px] shadow-glow-purple/5">
            <div className="absolute top-0 right-0 p-4 lg:p-6 opacity-[0.03]">
               <BarChart2 className="w-12 h-12 lg:w-16 lg:h-16 text-primary" />
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center shadow-inner">
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 lg:w-5 lg:h-5" })}
            </div>
            <div className="space-y-0.5 lg:space-y-1 relative z-10">
               <p className="text-[7px] lg:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">{stat.label}</p>
               <h4 className="text-lg lg:text-3xl font-black text-[var(--foreground)] leading-none italic tracking-tighter shadow-glow-purple/5">{stat.value}</h4>
               <p className="text-[6px] lg:text-[8px] font-black text-text-secondary italic uppercase tracking-widest opacity-20">{stat.change}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Promotions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase flex items-center gap-3">
               <Tag className="w-5 h-5 text-primary" /> Incentive Registry
            </h3>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Active & Scheduled Commissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-4 text-[8px] font-black uppercase border-[var(--foreground)]/5 rounded-[12px]">FILTER</Button>
          </div>
        </div>

        {/* Mobile: Promotion Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {PROMOTIONS.map((promo) => (
            <Card key={promo.id} className="p-5 space-y-4 rounded-[24px]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Incentive Identity</p>
                  <p className="text-sm font-bold text-[var(--foreground)] uppercase">{promo.title}</p>
                </div>
                <Badge variant={promo.status === "ACTIVE" ? "success" : promo.status === "SCHEDULED" ? "warning" : "secondary"} className="h-6 text-[8px]">
                  {promo.status}
                </Badge>
              </div>
              
              <div className="p-4 bg-[var(--foreground)]/5 rounded-[16px] border border-[var(--foreground)]/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-text-secondary uppercase">Signal Code</span>
                  <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-[0.2em]">
                    {promo.code}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-text-secondary uppercase">Yield Ratio</span>
                  <span className="text-xs font-black text-[var(--foreground)] flex items-center gap-1">
                    <Percent className="w-3 h-3 text-success" /> {promo.discount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-text-secondary uppercase">Fleet Usage</span>
                  <span className="text-[10px] font-black text-[var(--foreground)]">{promo.usage}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">{promo.end}</p>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-full bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all"><Edit3 className="w-4 h-4" /></button>
                  <button className="p-2.5 rounded-full bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop: Promotions Table */}
        <Card className="hidden lg:block p-1 rounded-[28px] md:rounded-[40px] overflow-hidden bg-bg-secondary/10 border-[var(--foreground)]/5 shadow-premium">
          <Table>
             <TableHeader>
                <TableRow className="border-[var(--foreground)]/5">
                   <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40 pl-8">Incentive Identity</TableHead>
                   <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Signal Code</TableHead>
                   <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Yield Ratio</TableHead>
                   <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Fleet Usage</TableHead>
                   <TableHead className="text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Temporal Status</TableHead>
                   <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Governance</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {PROMOTIONS.map((promo) => (
                   <TableRow key={promo.id} className="group border-[var(--foreground)]/5 hover:bg-white/[0.02] transition-all h-14 md:h-16">
                      <TableCell className="pl-8">
                         <div className="space-y-0.5">
                            <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic">{promo.title}</p>
                            <p className="text-[8px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">ID: {promo.id}</p>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="glass" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest text-[9px] italic">
                            {promo.code}
                         </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2 text-[var(--foreground)] font-black italic text-xs md:text-sm tracking-tighter">
                            <Percent className="w-3 h-3 text-success shadow-glow-purple/20" /> {promo.discount}
                         </div>
                      </TableCell>
                      <TableCell className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">{promo.usage}</TableCell>
                      <TableCell>
                         <div className="space-y-0.5">
                            <Badge variant={promo.status === "ACTIVE" ? "success" : promo.status === "SCHEDULED" ? "warning" : "secondary"} className="text-[8px] md:text-[9px] italic px-2">
                                {promo.status}
                            </Badge>
                            <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-20">{promo.end}</p>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                         <div className="flex justify-end gap-[4px]">
                            <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                               <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                               <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                               <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                         </div>
                      </TableCell>
                   </TableRow>
                ))}
             </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  
  );
}
