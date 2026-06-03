"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  UserCheck, 
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  CreditCard
} from "lucide-react";

const VERIFICATION_REQUESTS = [
  { id: "VER-9982", name: "Nordic Harvest Ltd", type: "SELLER LICENSE", document: "ISO-22000 Cert", status: "PENDING", time: "12m ago" },
  { id: "VER-9981", name: "Admiral John Doe", type: "RANK UPGRADE", document: "Fleet History", status: "PENDING", time: "42m ago" },
  { id: "VER-9980", name: "Pacific Fresh Co", type: "SELLER LICENSE", document: "Maritime Permit", status: "UNDER REVIEW", time: "2h ago" },
  { id: "VER-9979", name: "Alice Thompson", type: "KYC VERIFICATION", document: "Passport ID", status: "APPROVED", time: "5h ago" },
];

export default function AdminVerificationsPage() {
  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Identity Sovereignty</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Governing Global User Verifications & Merchant Commissions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
           <Button variant="outline" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 border-[var(--foreground)]/5 rounded-lg md:rounded-xl italic">
              <Clock className="w-3.5 md:w-4 h-3.5 md:h-4 text-primary shadow-glow-purple/5" /> PENDING ONLY
           </Button>
           <Button variant="primary" className="w-full sm:w-auto h-10 md:h-12 px-6 md:px-8 text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
             <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4" /> VERIFICATION SETTINGS
           </Button>
        </div>
      </div>

      {/* Verification Pulse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Pending Reviews", value: "24", icon: <Clock className="text-warning" /> },
          { label: "Merchant Licenses", value: "158", icon: <FileText className="text-primary" /> },
          { label: "Admiral KYC", value: "1,240", icon: <UserCheck className="text-success" /> },
          { label: "Flagged Entries", value: "8", icon: <AlertCircle className="text-danger" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-8 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 hover:border-primary/20 transition-all group rounded-[24px] md:rounded-[40px] shadow-premium">
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
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Commission Registry</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Global Identity & Asset Verification Logs</p>
           </div>
           <div className="relative group w-full md:w-80">
              <Input placeholder="SEARCH IDENTITY..." className="h-10 md:h-12 pl-10 md:pl-12 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
              <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
           </div>
        </div>
        <div className="hidden lg:block">
           <Table>
              <TableHeader>
                 <TableRow className="border-[var(--foreground)]/5">
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Identity Name</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Directive Type</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Attached Asset</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                    <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Governance</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {VERIFICATION_REQUESTS.map((req) => (
                    <TableRow key={req.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell>
                          <div className="space-y-0.5 md:space-y-1">
                             <p className="font-black text-[var(--foreground)] text-xs md:text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors">{req.name}</p>
                             <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">Commissioned {req.time}</p>
                          </div>
                       </TableCell>
                       <TableCell>
                          <Badge variant="secondary" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] md:text-[8px] tracking-[0.2em] italic font-black px-2">
                             {req.type}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-[9px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest italic flex items-center gap-2">
                          <FileText className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary shadow-glow-purple/10" /> {req.document}
                       </TableCell>
                       <TableCell>
                          <Badge variant={
                             req.status === "APPROVED" ? "success" : 
                             req.status === "PENDING" ? "warning" : 
                             "secondary"
                          } className="text-[7px] md:text-[9px] italic px-2 uppercase font-black tracking-widest">
                             {req.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right pr-4 md:pr-6">
                          <div className="flex justify-end gap-1 md:gap-2">
                             <button className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                                <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
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
        </div>

        {/* Mobile card list */}
        <div className="lg:hidden space-y-3 p-4">
           {VERIFICATION_REQUESTS.map((req) => (
              <div key={req.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
                 <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                       <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase">{req.name}</p>
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">ID: {req.id} • {req.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                       <Badge variant="secondary" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[7px] tracking-[0.1em] italic font-black px-1.5">
                          {req.type}
                       </Badge>
                       <Badge variant={
                          req.status === "APPROVED" ? "success" : 
                          req.status === "PENDING" ? "warning" : 
                          "secondary"
                       } className="text-[7px] italic px-1.5 uppercase font-black tracking-widest">
                          {req.status}
                       </Badge>
                    </div>
                 </div>
                 <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                    <div className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-widest italic flex items-center gap-1.5">
                       <FileText className="w-3.5 h-3.5 text-primary" /> {req.document}
                    </div>
                    <div className="flex gap-1">
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/5">
                          <Eye className="w-3.5 h-3.5" />
                       </button>
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-success transition-all border border-[var(--foreground)]/5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                       </button>
                       <button className="p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                          <XCircle className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </Card>

      {/* Security Advisory */}
      <Card className="p-[10px] md:p-10 bg-danger/5 border border-danger/10 space-y-4 md:space-y-6 rounded-[24px] md:rounded-[48px] shadow-premium">
         <div className="flex items-center gap-3 md:gap-4 text-danger border-b border-danger/10 pb-3 md:pb-4">
            <AlertCircle className="w-4 md:w-5 h-4 md:h-5 shadow-glow" />
            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest italic">Identity Security Protocol</h3>
         </div>
         <p className="text-[10px] md:text-xs text-text-secondary font-black leading-relaxed italic opacity-80">
            All verification decisions are immutable once committed to the Global Registry. Ensure multi-factor document authentication has been completed for all <span className="text-primary font-black uppercase tracking-tighter">Merchant License</span> requests.
         </p>
      </Card>
    </div>
  
  );
}
