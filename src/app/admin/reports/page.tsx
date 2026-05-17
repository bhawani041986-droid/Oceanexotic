"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Download, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  IndianRupee,
  Users
} from "lucide-react";

const PERFORMANCE_METRICS = [
  { label: "Gross Trade Volume", value: "₹1.24M", change: "+12.4%", trend: "up", icon: <IndianRupee /> },
  { label: "Active Fleet (Merchants)", value: "842", change: "+4.2%", trend: "up", icon: <Activity /> },
  { label: "Customer Acquisition", value: "12,480", change: "-2.1%", trend: "down", icon: <Users /> },
  { label: "Logistics Efficiency", value: "98.2%", change: "+0.8%", trend: "up", icon: <TrendingUp /> },
];

export default function AdminReportsPage() {
  return (

    <div className="space-y-6 md:space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Sovereignty Command</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Administrative Roles & Global Platform Permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase flex items-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg italic">
              <Calendar className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" /> TIME RANGE: MAY 2026
           </Button>
           <Button variant="primary" className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-2 md:gap-3 rounded-lg italic">
             <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION ROLE
           </Button>
        </div>
      </div>

      {/* Macro Pulse Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
        {PERFORMANCE_METRICS.map((metric) => (
          <Card key={metric.label} className="p-[10px] md:p-6 space-y-4 md:space-y-6 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group shadow-premium rounded-[24px] md:rounded-[40px]">
            <div className="flex items-center justify-between">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
                  {React.cloneElement(metric.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
               </div>
               <div className={`flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic ${metric.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-3 md:w-3.5 h-3 md:h-3.5 shadow-glow-purple" /> : <ArrowDownRight className="w-3 md:w-3.5 h-3 md:h-3.5 shadow-glow-purple" />}
                  {metric.change}
               </div>
            </div>
            <div className="space-y-0.5 md:space-y-1">
               <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{metric.label}</p>
               <h4 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{metric.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Trade Hotspots (Simulated Visual) */}
        <Card className="lg:col-span-2 p-[10px] md:p-10 space-y-4 md:space-y-8 bg-bg-secondary/40">
           <div className="flex items-center justify-between border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
              <div className="flex items-center gap-2 md:gap-4">
                 <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                 <h3 className="text-sm md:text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Global Trade Velocity</h3>
              </div>
              <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20">REAL-TIME SYNC</Badge>
           </div>
           <div className="h-48 md:h-64 flex items-end gap-2 md:gap-4 px-2 md:px-4">
              {[60, 45, 80, 55, 90, 70, 85, 40, 65, 75, 50, 95].map((h, i) => (
                <div key={i} className="flex-1 space-y-3 group">
                   <div className="relative w-full bg-[var(--foreground)]/5 rounded-t-[4px] md:rounded-t-[10px] overflow-hidden min-h-[20px]" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-primary opacity-40 group-hover:opacity-100 transition-all" />
                   </div>
                   <p className="text-[6px] md:text-[8px] font-black text-text-secondary text-center uppercase tracking-tighter">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</p>
                </div>
              ))}
           </div>
        </Card>

        {/* Category Distribution */}
        <Card className="lg:col-span-1 p-[10px] md:p-10 space-y-4 md:space-y-8 bg-bg-secondary/40">
           <div className="flex items-center gap-2 md:gap-4 border-b border-[var(--foreground)]/5 pb-4 md:pb-6">
              <PieChart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h3 className="text-sm md:text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Sector Yields</h3>
           </div>
           <div className="space-y-4 md:space-y-6">
              {[
                { label: "Premium Saku", value: "42%", color: "bg-primary" },
                { label: "Wild Crustaceans", value: "28%", color: "bg-purple-500" },
                { label: "Deep Sea Whitefish", value: "18%", color: "bg-success" },
                { label: "Other Harvests", value: "12%", color: "bg-[var(--foreground)]/20" },
              ].map((item) => (
                <div key={item.label} className="space-y-1 md:space-y-2">
                   <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="text-[var(--foreground)]">{item.value}</span>
                   </div>
                   <div className="h-1.5 md:h-2 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }} />
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>

      {/* Performance Ledger */}
      <Card className="p-1 overflow-hidden">
         <div className="p-4 md:p-8 border-b border-[var(--foreground)]/5 flex items-center justify-between">
            <h3 className="text-sm md:text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">High-Yield Harvest Node Analytics</h3>
            <Button variant="ghost" className="text-[8px] md:text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 flex items-center gap-2 md:gap-3">
               VIEW FULL DIRECTIVE <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
         </div>
         <Table>
            <TableHeader>
               <TableRow className="hover:bg-transparent">
                  <TableHead>Maritime Sector</TableHead>
                  <TableHead>Trade Volume</TableHead>
                  <TableHead>Fulfillment SLA</TableHead>
                  <TableHead>Merchant Health</TableHead>
                  <TableHead className="text-right">Market Trend</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {[
                 { sector: "North Atlantic (SEC-01)", volume: "₹420K", sla: "98.4%", health: "OPTIMAL", trend: "+8.2%" },
                 { sector: "Sea of Japan (SEC-04)", volume: "₹380K", sla: "99.1%", health: "OPTIMAL", trend: "+12.4%" },
                 { sector: "Bering Sea (SEC-02)", volume: "₹240K", sla: "96.8%", health: "STABLE", trend: "-2.1%" },
                 { sector: "Mediterranean (SEC-08)", volume: "₹180K", sla: "97.5%", health: "STABLE", trend: "+4.5%" },
               ].map((row) => (
                 <TableRow key={row.sector}>
                    <TableCell className="font-bold text-[var(--foreground)] text-sm uppercase tracking-tight">{row.sector}</TableCell>
                    <TableCell className="font-black text-primary">{row.volume}</TableCell>
                    <TableCell className="font-black text-[var(--foreground)]">{row.sla}</TableCell>
                    <TableCell>
                       <Badge variant={row.health === "OPTIMAL" ? "success" : "secondary"}>
                          {row.health}
                       </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-black uppercase tracking-widest text-[10px] ${row.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                       {row.trend}
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </Card>
    </div>
  
  );
}
