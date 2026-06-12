"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  IndianRupee, 
  Wallet, 
  ArrowUpRight, 
  Download,
  Calendar,
  ChevronRight,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTLEMENT_HISTORY = [
  { id: "ST-8821", date: "May 08, 2026", amount: "₹1,42,050.00", status: "COMPLETED", method: "OceanWire" },
  { id: "ST-8815", date: "May 01, 2026", amount: "₹2,84,000.00", status: "COMPLETED", method: "OceanWire" },
  { id: "ST-8790", date: "April 24, 2026", amount: "₹98,020.00", status: "COMPLETED", method: "Direct Transfer" },
];

export default function SellerEarningsPage() {
  return (

    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-32 md:pb-10 px-4 md:px-0 animate-fade-in">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-6">
        <Card className="md:col-span-2 p-[10px] md:p-6 relative overflow-hidden group rounded-[20px] md:rounded-[40px] bg-bg-secondary/10 border-[var(--foreground)]/5 shadow-glow-purple/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -mr-24 -mt-24 transition-all group-hover:scale-110" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-[20px] md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-0.5 md:space-y-1.5">
                <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] italic opacity-60">Capital Systemty</p>
                <h2 className="text-2xl md:text-5xl lg:text-[48px] font-black text-[var(--foreground)] leading-none tracking-tighter italic shadow-glow-purple/5">₹8,64,250.50</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Button className="h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple rounded-lg italic">
                  INITIATE WITHDRAWAL
                </Button>
                <Button variant="outline" className="h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase rounded-lg border-[var(--foreground)]/5 bg-[var(--foreground)]/5 italic">
                  STATEMENTS
                </Button>
              </div>
            </div>
            <div className="space-y-2 md:text-right">
              <div className="p-2.5 md:p-4 rounded-xl md:rounded-[20px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 inline-block w-full sm:w-auto shadow-inner">
                <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest mb-0.5 italic opacity-60">Pending Settlement</p>
                <p className="text-base md:text-xl font-black text-primary italic tracking-tighter">₹1,24,000.00</p>
              </div>
              <p className="text-[7px] md:text-[9px] text-text-secondary font-black italic max-w-[180px] md:ml-auto leading-relaxed opacity-40 uppercase tracking-tight">
                Automated settlement: <span className="text-[var(--foreground)]">May 15, 2026</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-[10px] md:p-6 space-y-4 md:space-y-6 bg-bg-secondary/10 rounded-[20px] md:rounded-[40px] border-[var(--foreground)]/5">
          <div className="space-y-0.5 md:space-y-1">
            <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Earnings Pulse</h3>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-40">Monthly Growth Analysis</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="space-y-0">
                <p className="text-[9px] font-black text-[var(--foreground)] uppercase italic opacity-40">Period Yield</p>
                <p className="text-xl md:text-2xl font-black text-primary italic tracking-tighter">₹12.45L</p>
              </div>
              <Badge variant="success" className="text-[7px] md:text-[9px] h-4 md:h-5 px-1.5 md:px-2 shadow-glow-purple/10 italic">+24%</Badge>
            </div>
            <div className="h-px bg-[var(--foreground)]/5" />
            <div className="flex justify-between items-end opacity-20">
              <div className="space-y-0">
                <p className="text-[9px] font-black text-[var(--foreground)] uppercase italic">Prior</p>
                <p className="text-sm md:text-base font-black text-[var(--foreground)] italic tracking-tighter">₹10.04L</p>
              </div>
              <span className="text-[6px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic">BASELINE</span>
            </div>
          </div>
          <div className="pt-1">
             <div className="h-8 md:h-12 flex items-end gap-[1px] md:gap-1 px-1">
                {[30, 45, 25, 60, 40, 75, 55, 90, 65, 80].map((h, i) => (
                   <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/10 rounded-t-[2px] md:rounded-t-[4px] hover:bg-primary transition-all cursor-pointer shadow-glow-purple/10" />
                ))}
             </div>
          </div>
        </Card>
      </div>

      {/* Analytics Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Avg. Sale Value", value: "₹14,250", icon: <IndianRupee />, trend: "+4.2%" },
          { label: "Commissions", value: "842", icon: <BarChart3 />, trend: "+12%" },
          { label: "Fees Incurred", value: "₹42,050", icon: <Wallet />, trend: "-2.1%" },
          { label: "Growth Index", value: "8.4", icon: <TrendingUp />, trend: "OPTIMAL" },
        ].map((item) => (
          <Card key={item.label} className="p-[10px] md:p-6 space-y-2 md:space-y-3 rounded-xl md:rounded-[24px] bg-bg-secondary/10 border-[var(--foreground)]/5 shadow-glow-purple/5">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary shadow-inner">
              {React.cloneElement(item.icon as React.ReactElement, { className: "w-3 h-3 md:w-4 md:h-4" })}
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none italic opacity-40">{item.label}</p>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-base md:text-xl font-black text-[var(--foreground)] leading-none italic tracking-tighter">{item.value}</h4>
                <span className="text-[6px] md:text-[8px] font-black text-success uppercase tracking-widest italic">{item.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Settlement History Section */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h3 className="text-base md:text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic">Settlement Registry</h3>
            <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Global Financial Transfers</p>
          </div>
          <div className="flex gap-1.5 md:gap-2">
            <Button variant="ghost" size="sm" className="h-8 md:h-9 px-3 md:px-4 rounded-lg md:rounded-[12px] text-[7px] md:text-[8px] font-black uppercase tracking-widest bg-[var(--foreground)]/5 italic"><Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2" /> DATE</Button>
            <Button variant="outline" size="sm" className="h-8 md:h-9 px-3 md:px-4 rounded-lg md:rounded-[12px] text-[7px] md:text-[8px] font-black uppercase tracking-widest border-[var(--foreground)]/5 italic"><Download className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2" /> EXPORT</Button>
          </div>
        </div>

        {/* Mobile: Settlement Cards */}
        <div className="grid grid-cols-1 gap-[10px] lg:hidden">
          {SETTLEMENT_HISTORY.map((settlement) => (
            <Card key={settlement.id} className="p-[10px] space-y-3 rounded-[20px] bg-bg-secondary/20">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Settlement Node</p>
                  <p className="text-[11px] font-black text-[var(--foreground)] uppercase italic tracking-tighter">{settlement.id}</p>
                </div>
                <Badge variant="success" className="h-5 text-[7px] px-1.5 shadow-glow-purple italic uppercase">{settlement.status}</Badge>
              </div>
              <div className="p-3 bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/5 flex justify-between items-center shadow-inner">
                <div className="space-y-0">
                  <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Execution</p>
                  <p className="text-[10px] font-black text-[var(--foreground)] italic">{settlement.date}</p>
                </div>
                <div className="text-right space-y-0">
                  <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Net Yield</p>
                  <p className="text-[10px] font-black text-primary italic">{settlement.amount}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">via {settlement.method}</p>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg bg-[var(--foreground)]/5 border border-[var(--foreground)]/5"><ChevronRight className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop: Settlement Table */}
        <Card className="hidden lg:block p-1 rounded-[24px] md:rounded-[40px] overflow-hidden shadow-premium bg-bg-secondary/10 border-[var(--foreground)]/5">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--foreground)]/5">
                <TableHead className="min-w-[120px] text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Settlement ID</TableHead>
                <TableHead className="min-w-[120px] text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Execution Date</TableHead>
                <TableHead className="hidden md:table-cell min-w-[150px] text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Method</TableHead>
                <TableHead className="min-w-[100px] text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Net Amount</TableHead>
                <TableHead className="min-w-[120px] text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Status</TableHead>
                <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary opacity-40">Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SETTLEMENT_HISTORY.map((settlement) => (
                <TableRow key={settlement.id} className="group border-[var(--foreground)]/5 hover:bg-white/[0.02] transition-all h-14 md:h-16">
                  <TableCell className="font-black text-[var(--foreground)] uppercase tracking-tighter italic text-xs md:text-sm">{settlement.id}</TableCell>
                  <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-40">{settlement.date}</TableCell>
                  <TableCell className="hidden md:table-cell text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">{settlement.method}</TableCell>
                  <TableCell className="font-black text-[var(--foreground)] italic text-xs md:text-sm tracking-tighter">{settlement.amount}</TableCell>
                  <TableCell>
                    <Badge variant="success" className="text-[8px] md:text-[10px] shadow-glow-purple/10 italic uppercase px-2">{settlement.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 transition-all text-text-secondary hover:text-[var(--foreground)] border border-[var(--foreground)]/5">
                      <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
                    </button>
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
