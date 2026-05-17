"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  RotateCcw, 
  Search, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Filter,
  ArrowDownLeft,
  FileText
} from "lucide-react";

const REFUND_REGISTRY = [
  { id: "REF-001", order: "#ORD-9982", amount: "₹64.00", reason: "Damaged Harvest", merchant: "Global Seafoods", status: "PENDING", time: "14m ago" },
  { id: "REF-002", order: "#ORD-9975", amount: "₹42.00", reason: "Delivery Void", merchant: "Nordic Harvest", status: "AUTHORIZED", time: "2h ago" },
  { id: "REF-003", order: "#ORD-9960", amount: "₹120.00", reason: "Cold-Chain Breach", merchant: "Arctic Sourcing", status: "REJECTED", time: "5h ago" },
];

export default function AdminRefundsPage() {
  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Settlement Reversal</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Global Platform Refunds & Financial Corrections</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <Download className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary shadow-glow-purple/5" /> EXPORT LEDGER
           </Button>
           <Button variant="primary" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
             <RotateCcw className="w-3.5 md:w-4 h-3.5 md:h-4" /> BATCH REVERSAL
           </Button>
        </div>
      </div>

      {/* Financial Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Pending Reversals", value: "8", icon: <Clock className="text-warning" /> },
          { label: "Authorized (24h)", value: "₹1,240", icon: <CheckCircle2 className="text-success" /> },
          { label: "Rejected (24h)", value: "₹420", icon: <XCircle className="text-danger" /> },
          { label: "Total Liabilities", value: "₹8,400", icon: <IndianRupee className="text-primary" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-8 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] shadow-premium">
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
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Reversal Registry</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Ledger of Settlement Corrections</p>
           </div>
           <div className="relative group w-full md:w-80">
              <Input placeholder="SEARCH REVERSAL ID..." className="h-10 md:h-12 pl-10 md:pl-12 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
              <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
           </div>
        </div>
        <Table>
           <TableHeader>
              <TableRow className="border-[var(--foreground)]/5">
                 <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Directive (Order)</TableHead>
                 <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Settlement Amount</TableHead>
                 <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Correction Reason</TableHead>
                 <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Liable Merchant</TableHead>
                 <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                 <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Governance</TableHead>
              </TableRow>
           </TableHeader>
           <TableBody>
              {REFUND_REGISTRY.map((ref) => (
                 <TableRow key={ref.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                    <TableCell className="font-black text-primary text-[9px] md:text-[10px] uppercase tracking-widest italic">{ref.order}</TableCell>
                    <TableCell className="font-black text-[var(--foreground)] text-xs md:text-sm italic">{ref.amount}</TableCell>
                    <TableCell className="text-[10px] md:text-xs font-black text-text-secondary italic opacity-60">{ref.reason}</TableCell>
                    <TableCell className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic">{ref.merchant}</TableCell>
                    <TableCell>
                       <Badge variant={
                          ref.status === "AUTHORIZED" ? "success" : 
                          ref.status === "PENDING" ? "warning" : 
                          "secondary"
                       } className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest">
                          {ref.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4 md:pr-6">
                       <div className="flex justify-end gap-1 md:gap-2">
                          <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                             <FileText className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                          <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-success transition-all border border-[var(--foreground)]/5">
                             <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                          <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                             <XCircle className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </button>
                       </div>
                    </TableCell>
                 </TableRow>
              ))}
           </TableBody>
        </Table>
      </Card>
    </div>
  
  );
}
