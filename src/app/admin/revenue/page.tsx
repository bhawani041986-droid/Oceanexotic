"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Download,
  CreditCard,
  Percent,
  Wallet,
  Activity,
  ChevronRight,
  BarChart3,
  PieChart
} from "lucide-react";

const REVENUE_METRICS = [
  { label: "Gross Trade Volume", value: "₹42.8M", change: "+14.2%", trend: "up", icon: <IndianRupee /> },
  { label: "Platform Commission", value: "₹5.13M", change: "+12.8%", trend: "up", icon: <Percent /> },
  { label: "Net Merchant Payouts", value: "₹37.6M", change: "+15.1%", trend: "up", icon: <Wallet /> },
  { label: "Platform Service Fees", value: "₹840K", change: "-2.4%", trend: "down", icon: <CreditCard /> },
];

export default function AdminRevenuePage() {
  return (
    <>
    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic text-primary shadow-glow-purple/5">Financial Sovereign Ledger</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Analyzing the Global Economic Yield of the OceanExotic Global Network</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <Calendar className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary shadow-glow-purple/5" /> FISCAL PERIOD: Q2 2026
           </Button>
           <Button variant="primary" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
             <Download className="w-3.5 md:w-4 h-3.5 md:h-4" /> EXPORT FINANCIALS
           </Button>
        </div>
      </div>

      {/* Financial Pulse Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-8">
        {REVENUE_METRICS.map((metric) => (
          <Card key={metric.label} className="p-[10px] md:p-8 space-y-4 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-premium">
            <div className="flex items-center justify-between">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                  {React.cloneElement(metric.icon as React.ReactElement, { className: "w-4 md:w-5 h-4 md:h-5" })}
               </div>
               <div className={`flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic ${metric.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-3 md:w-3.5 h-3 md:h-3.5" /> : <ArrowDownRight className="w-3 md:w-3.5 h-3 md:h-3.5" />}
                  {metric.change}
               </div>
            </div>
            <div className="space-y-0.5 md:space-y-1">
               <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{metric.label}</p>
               <h4 className="text-xl md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{metric.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px] md:gap-10">
        {/* Revenue Growth (Simulated Visual) */}
        <Card className="lg:col-span-2 p-[10px] md:p-10 space-y-6 md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] shadow-premium">
           <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
              <div className="flex items-center gap-3 md:gap-4">
                 <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary shadow-glow-purple/10" />
                 <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Revenue Velocity Node</h3>
              </div>
              <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[7px] md:text-[8px] italic px-2">LIVE TELEMETRY</Badge>
           </div>
           <div className="h-48 md:h-64 flex items-end gap-2 md:gap-4 px-2 md:px-4">
              {[40, 55, 30, 65, 80, 50, 95, 70, 85, 60, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 space-y-2 md:space-y-3 group">
                   <div className="relative w-full bg-[var(--foreground)]/5 rounded-t-[6px] md:rounded-t-[10px] overflow-hidden min-h-[10px] md:min-h-[20px]" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/40 opacity-20 md:opacity-40 group-hover:opacity-100 transition-all shadow-glow-purple" />
                   </div>
                   <p className="text-[6px] md:text-[8px] font-black text-text-secondary text-center uppercase tracking-tighter italic opacity-40">{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][i]}</p>
                </div>
              ))}
           </div>
        </Card>

        {/* Sector Profitability */}
        <Card className="lg:col-span-1 p-[10px] md:p-10 space-y-6 md:space-y-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[48px] shadow-premium">
           <div className="flex items-center gap-3 md:gap-4 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
              <PieChart className="w-4 h-4 md:w-5 md:h-5 text-primary shadow-glow-purple/10" />
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Yield Sectors</h3>
           </div>
           <div className="space-y-4 md:space-y-6">
              {[
                { label: "Premium Saku Yields", value: "₹18.4M", percent: 42, color: "bg-primary" },
                { label: "Merchant Commission", value: "₹12.2M", percent: 28, color: "bg-purple-500" },
                { label: "Service Surcharge", value: "₹7.8M", percent: 18, color: "bg-success" },
                { label: "Asset Listing Fees", value: "₹4.4M", percent: 12, color: "bg-[var(--foreground)]/20" },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5 md:space-y-2">
                   <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">
                      <span className="text-text-secondary opacity-60">{item.label}</span>
                      <span className="text-[var(--foreground)]">{item.value}</span>
                   </div>
                   <div className="h-1 md:h-2 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full shadow-glow-purple transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                   </div>
                </div>
              ))}
           </div>
           <div className="p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-primary/10 border border-primary/20 space-y-1.5 md:space-y-2">
              <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Sovereign Yield Alert</p>
              <p className="text-[8px] md:text-[10px] text-[var(--foreground)] font-black leading-relaxed italic opacity-80">Revenue growth is tracking 4.2% above fiscal projections for Q2.</p>
           </div>
        </Card>
      </div>

      {/* Merchant Revenue Table */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
         <div className="p-[10px] md:p-8 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
               <Activity className="w-5 h-5 md:w-6 md:h-6 text-primary shadow-glow-purple/10" />
               <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Top Yielding Merchant Nodes</h3>
            </div>
            <Button variant="ghost" className="text-[8px] md:text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 flex items-center justify-center gap-2 md:gap-3 italic">
               VIEW FULL FINANCIAL DIRECTIVE <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
            </Button>
         </div>
          <div className="hidden lg:block">
            <Table>
               <TableHeader>
                  <TableRow className="border-[var(--foreground)]/5">
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Merchant Source</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Gross Volume</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Platform Cut</TableHead>
                     <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Payout Status</TableHead>
                     <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Market Integrity</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {[
                    { merchant: "Nordic Prime Fisheries", volume: "₹1.24M", cut: "₹148.8K", status: "SETTLED", integrity: "99.4%" },
                    { merchant: "Mediterranean Catch", volume: "₹940K", cut: "₹112.8K", status: "PENDING", integrity: "98.2%" },
                    { merchant: "Pacific Rim Harvests", volume: "₹820K", cut: "₹98.4K", status: "SETTLED", integrity: "99.1%" },
                    { merchant: "Bering Sea Sourcing", volume: "₹650K", cut: "₹78K", status: "SETTLED", integrity: "97.5%" },
                  ].map((row) => (
                    <TableRow key={row.merchant} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{row.merchant}</TableCell>
                       <TableCell className="font-black text-[var(--foreground)] text-xs md:text-sm italic">{row.volume}</TableCell>
                       <TableCell className="font-black text-primary text-xs md:text-sm italic">{row.cut}</TableCell>
                       <TableCell>
                          <Badge variant={row.status === "SETTLED" ? "success" : "warning"} className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest">
                             {row.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right font-black text-[var(--foreground)] text-[8px] md:text-[10px] tracking-widest italic pr-4 md:pr-6">{row.integrity}</TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         {/* Mobile card list */}
         <div className="lg:hidden space-y-3 p-4">
            {[
              { merchant: "Nordic Prime Fisheries", volume: "₹1.24M", cut: "₹148.8K", status: "SETTLED", integrity: "99.4%" },
              { merchant: "Mediterranean Catch", volume: "₹940K", cut: "₹112.8K", status: "PENDING", integrity: "98.2%" },
              { merchant: "Pacific Rim Harvests", volume: "₹820K", cut: "₹98.4K", status: "SETTLED", integrity: "99.1%" },
              { merchant: "Bering Sea Sourcing", volume: "₹650K", cut: "₹78K", status: "SETTLED", integrity: "97.5%" },
            ].map((row) => (
               <div key={row.merchant} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                  <div className="flex items-start justify-between">
                     <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-tighter italic">{row.merchant}</p>
                     <Badge variant={row.status === "SETTLED" ? "success" : "warning"} className="text-[7px] italic px-1.5 uppercase font-black tracking-widest">
                        {row.status}
                     </Badge>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                     <div className="space-y-0">
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Gross Volume</p>
                        <p className="text-xs font-black text-[var(--foreground)] italic">{row.volume}</p>
                     </div>
                     <div className="space-y-0">
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Platform Cut</p>
                        <p className="text-xs font-black text-primary italic">{row.cut}</p>
                     </div>
                     <div className="text-right space-y-0">
                        <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Market Integrity</p>
                        <p className="text-xs font-black text-[var(--foreground)] italic">{row.integrity}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </Card>
    </div>
  
    </>
  );
}
