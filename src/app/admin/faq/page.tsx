"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Edit3, 
  Trash2,
  MoreVertical,
  ChevronRight,
  Filter
} from "lucide-react";

const FAQ_REGISTRY = [
  { id: "FAQ-001", question: "How is cold-chain integrity verified?", category: "LOGISTICS", status: "PUBLISHED", views: "12.4K" },
  { id: "FAQ-002", question: "What are the Admiral Rank thresholds?", category: "LOYALTY", status: "PUBLISHED", views: "8.2K" },
  { id: "FAQ-003", question: "How to commission a bulk harvest?", category: "ORDERING", status: "DRAFT", views: "0" },
  { id: "FAQ-004", question: "Refund policy for transit delays?", category: "LEGAL", status: "PUBLISHED", views: "4.1K" },
];

export default function AdminFAQPage() {
  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Knowledge Authority</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Global Support Documentation & Fleet FAQ</p>
        </div>
        <Button variant="primary" className="w-full md:w-auto h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic">
          <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION DOCUMENT
        </Button>
      </div>

      {/* Registry Table */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5 overflow-hidden">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
           <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Knowledge Registry</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Support Signal Entries</p>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
              <div className="relative group w-full md:w-64">
                 <Input placeholder="SEARCH REGISTRY..." className="h-10 md:h-12 pl-10 md:pl-12 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
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
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Support Inquiry</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Category</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Signal Intensity (Views)</TableHead>
                    <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                    <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary pr-4 md:pr-6">Governance</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {FAQ_REGISTRY.map((faq) => (
                    <TableRow key={faq.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                       <TableCell><div className="space-y-0.5 max-w-md"><p className="font-black text-[var(--foreground)] text-sm uppercase tracking-tighter italic group-hover/row:text-primary transition-colors truncate">{faq.question}</p><p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-40">ID: {faq.id}</p></div></TableCell>
                       <TableCell><Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[9px] italic font-black px-2">{faq.category}</Badge></TableCell>
                       <TableCell className="font-black text-[var(--foreground)] text-sm italic tracking-tighter">{faq.views}</TableCell>
                       <TableCell><Badge variant={faq.status === "PUBLISHED" ? "success" : "secondary"} className="text-[9px] italic px-2 uppercase font-black tracking-widest">{faq.status}</Badge></TableCell>
                       <TableCell className="text-right pr-4 md:pr-6"><div className="flex justify-end gap-2"><button className="p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary border border-[var(--foreground)]/5"><Edit3 className="w-4 h-4" /></button><button className="p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger border border-[var(--foreground)]/5"><Trash2 className="w-4 h-4" /></button><button className="p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary border border-[var(--foreground)]/5"><MoreVertical className="w-4 h-4" /></button></div></TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </div>

        {/* Mobile card list */}
        <div className="lg:hidden space-y-3 p-4">
          {FAQ_REGISTRY.map((faq) => (
            <div key={faq.id} className="p-4 rounded-xl border border-[var(--foreground)]/5 bg-bg-card/40 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 flex-1 pr-3">
                  <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter uppercase line-clamp-2">{faq.question}</p>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{faq.id}</p>
                </div>
                <Badge variant={faq.status === "PUBLISHED" ? "success" : "secondary"} className="text-[7px] italic px-2 uppercase font-black tracking-widest shrink-0">{faq.status}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-2.5">
                <div className="flex items-center gap-3">
                  <Badge variant="glass" className="bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 uppercase text-[8px] italic font-black px-2">{faq.category}</Badge>
                  <span className="text-[9px] font-black text-primary italic">{faq.views} views</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary border border-[var(--foreground)]/5"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger border border-[var(--foreground)]/5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strategy Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-8">
         <Card className="p-[10px] md:p-8 flex items-center gap-4 md:gap-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] shadow-premium group hover:border-primary/20 transition-all">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow-purple/5">
               <HelpCircle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="space-y-1 md:space-y-2 text-left">
               <h4 className="text-sm md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Automated Signal Hub</h4>
               <p className="text-[8px] md:text-xs text-text-secondary font-black tracking-widest uppercase italic opacity-40 leading-relaxed">
                  AI-driven response protocols currently resolving <span className="text-[var(--foreground)] font-black">42%</span> of all support signals without human intervention.
               </p>
            </div>
         </Card>
         <Card className="p-[10px] md:p-8 flex items-center gap-4 md:gap-8 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] shadow-premium group hover:border-success/20 transition-all">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-[24px] bg-success/10 border border-success/20 flex items-center justify-center text-success shadow-glow-success/5">
               <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="space-y-1 md:space-y-2 text-left">
               <h4 className="text-sm md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Knowledge Systemty</h4>
               <p className="text-[8px] md:text-xs text-text-secondary font-black tracking-widest uppercase italic opacity-40 leading-relaxed">
                  Total of <span className="text-[var(--foreground)] font-black">124</span> platform directives active. Average document health: <span className="text-success font-black">98%</span>.
               </p>
            </div>
         </Card>
      </div>
    </div>
  
  );
}
