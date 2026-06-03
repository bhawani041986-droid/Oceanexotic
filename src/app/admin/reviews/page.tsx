"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Star, 
  User, 
  Store, 
  ShieldAlert,
  Search,
  Filter,
  MoreVertical,
  Activity
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { reviewService } from "@/services/reviewService";

const INITIAL_REVIEWS = [
  { id: "REV-9921", author: "Deep Diver Dan", seller: "Global Seafoods", rating: 4, content: "Quality was exceptional, but the logistics node reported a slight delay in handshake. Still elite grade harvest.", status: "PENDING", flags: 0, date: "2h ago" },
  { id: "REV-9920", author: "Sea Scout Sarah", seller: "Nordic Harvest", rating: 5, content: "The Bluefin Saku represents the pinnacle of maritime excellence. Perfectly authorized transit.", status: "PENDING", flags: 0, date: "4h ago" },
  { id: "REV-9919", author: "Trawl Master Tom", seller: "Pacific Traders", rating: 2, content: "Content rejected. This harvest was not up to sustainable standards. Flagging for audit.", status: "FLAGGED", flags: 3, date: "Yesterday" },
  { id: "REV-9918", author: "Fleet Master Jin", seller: "Mediterranean Direct", rating: 5, content: "Superior cold-chain integrity. The Omani prawns arrived in pristine state.", status: "APPROVED", flags: 0, date: "2 days ago" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS
  );
  const { toast } = useToast(
  );

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      const result = await reviewService.moderateReview(id, action
  );
      if (result.success || result.status === "success") {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: action } : r)
  );
        toast(`Governance directive: ${id} is now ${action}`, "success"
  );
      } else {
        toast(result.message || "Governance Handshake Refused.", "error"
  );
      }
    } catch (err) {
      toast("Critical Governance Sync Failure.", "error"
  );
      console.error("Moderation Error:", err
  );
    }
  };

  return (

    <div className="space-y-[5px] md:space-y-6 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[5px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-5">
        <div className="space-y-0.5 text-center md:text-left">
          <h2 className="text-lg md:text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase italic flex items-center justify-center md:justify-start gap-2">
             <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary shadow-glow-purple" /> Reputation Command
          </h2>
          <p className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Seller Reviews & Marketplace Credibility Handshakes</p>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-4">
           <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 px-3 md:px-5 py-1.5 text-[7px] md:text-[9px] font-black tracking-widest uppercase italic shadow-glow-purple/5">
              {reviews.filter(r => r.status === "PENDING").length} PENDING AUDITS
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[5px] md:gap-6">
         
         {/* Moderation Metrics */}
         <div className="lg:col-span-1 space-y-[5px] md:space-y-4">
            <Card className="p-[8px] md:p-5 bg-bg-secondary/20 border-[var(--foreground)]/5 space-y-4 md:space-y-5 rounded-[20px] md:rounded-[32px] shadow-premium">
               <div className="flex items-center gap-2 md:gap-3 border-b border-[var(--foreground)]/5 pb-3 md:pb-4">
                  <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shadow-glow-purple" />
                  <h3 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tighter uppercase italic">Audit Pulse</h3>
               </div>
               <div className="space-y-[8px] md:space-y-4">
                  {[
                    { label: "Approval Rate", value: "94.2%", trend: "up" },
                    { label: "Flagged Content", value: "12", trend: "down" },
                    { label: "Avg. Audit Time", value: "1.4h", trend: "up" },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                       <div className="flex justify-between text-[6px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                          <span>{stat.label}</span>
                          <span className="text-[var(--foreground)]">{stat.value}</span>
                       </div>
                       <div className="w-full h-0.5 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                          <div className={cn(
                             "h-full bg-primary shadow-glow-purple",
                             stat.trend === "up" ? "w-[94%]" : "w-[12%]"
                          )} />
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-[8px] md:p-5 bg-danger/5 border-danger/10 space-y-2 md:space-y-3 rounded-[20px] md:rounded-[32px] shadow-glow-purple/5">
               <div className="flex items-center gap-2 text-danger">
                  <ShieldAlert className="w-3 h-3 md:w-3.5 md:h-3.5 shadow-glow-purple" />
                  <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest italic">Integrity Alert</p>
               </div>
               <p className="text-[8px] md:text-[10px] text-text-secondary font-black uppercase tracking-tight leading-relaxed italic opacity-60">3 reviews have been automatically flagged by our linguistic integrity node.</p>
               <Button variant="outline" className="w-full h-8 border-danger/20 text-danger hover:bg-danger hover:text-[var(--foreground)] transition-all text-[7px] md:text-[8px] font-black tracking-widest uppercase italic rounded-md">
                  AUDIT FLAGGED CONTENT
               </Button>
            </Card>
         </div>

         {/* Review Registry Ledger */}
         <div className="lg:col-span-3 space-y-[5px] md:space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-[5px] md:gap-4">
               <div className="relative group w-full md:w-80">
                  <Input placeholder="Search review registry..." className="h-9 md:h-10 pl-9 md:pl-10 text-[7px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
                  <Search className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 w-3 md:w-3.5 h-3 md:h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" className="flex-1 md:flex-none h-9 md:h-10 px-4 text-[7px] md:text-[9px] font-black uppercase border-[var(--foreground)]/5 gap-2 rounded-lg italic">
                     <Filter className="w-3 md:w-3.5 h-3 md:h-3.5" /> FILTER STATUS
                  </Button>
               </div>
            </div>

            <div className="space-y-[5px] md:space-y-4">
               {reviews.map((rev) => (
                  <Card key={rev.id} className={cn(
                     "p-1 group overflow-hidden transition-all rounded-[20px] md:rounded-[32px] shadow-premium",
                     rev.status === "PENDING" ? "border-primary/20 bg-primary/5" : "border-[var(--foreground)]/5 bg-bg-secondary/20"
                  )}>
                     <div className="p-[8px] md:p-5 space-y-3 md:space-y-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                           <div className="flex items-start gap-3 md:gap-4">
                              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-[14px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-primary shadow-glow-purple/5">
                                 <User className="w-4 md:w-5 h-4 md:h-5" />
                              </div>
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-2 md:gap-3">
                                    <h4 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tighter uppercase italic">{rev.author}</h4>
                                    <Badge variant={
                                       rev.status === "APPROVED" ? "success" : 
                                       rev.status === "FLAGGED" ? "danger" : 
                                       rev.status === "REJECTED" ? "danger" : "warning"
                                    } className="uppercase text-[6px] md:text-[8px] italic px-1.5">{rev.status}</Badge>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5 text-warning">
                                       {Array(5).fill(0).map((_, i) => (
                                          <Star key={i} className={cn("w-2.5 md:w-3.5 h-2.5 md:h-3.5", i < rev.rating ? "fill-current" : "opacity-20")} />
                                       ))}
                                    </div>
                                    <span className="text-[7px] md:text-[9px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">via {rev.seller} • {rev.date}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              {rev.status === "PENDING" || rev.status === "FLAGGED" ? (
                                 <>
                                    <Button 
                                       onClick={() => handleAction(rev.id, "APPROVED")}
                                       className="h-9 md:h-11 px-4 md:px-8 text-[8px] md:text-[10px] font-black uppercase bg-success hover:bg-success/80 shadow-glow-purple flex items-center gap-2 rounded-lg italic"
                                    >
                                       <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4" /> AUTHORIZE
                                    </Button>
                                    <Button 
                                       variant="outline"
                                       onClick={() => handleAction(rev.id, "REJECTED")}
                                       className="h-9 md:h-11 px-4 md:px-8 text-[8px] md:text-[10px] font-black uppercase border-danger/30 text-danger hover:bg-danger hover:text-[var(--foreground)] flex items-center gap-2 rounded-lg italic"
                                    >
                                       <XCircle className="w-3.5 md:w-4 h-3.5 md:h-4" /> REJECT
                                    </Button>
                                 </>
                              ) : (
                                 <Button variant="ghost" className="h-9 md:h-11 px-4 md:px-8 text-[8px] md:text-[10px] font-black uppercase opacity-40 hover:opacity-100 flex items-center gap-2 italic">
                                    <ShieldAlert className="w-3.5 md:w-4 h-3.5 md:h-4" /> FLAG REVIEW
                                 </Button>
                              )}
                              <button className="p-2 md:p-3 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary transition-all border border-[var(--foreground)]/5">
                                 <MoreVertical className="w-3.5 md:w-4 h-3.5 md:h-4" />
                              </button>
                           </div>
                        </div>

                        <div className="bg-[var(--foreground)]/5 rounded-[16px] md:rounded-[24px] p-4 md:p-6 border border-[var(--foreground)]/5 relative group/content">
                           <p className="text-xs md:text-base font-black text-[var(--foreground)] leading-relaxed max-w-4xl italic uppercase tracking-tight">
                              "{rev.content}"
                           </p>
                           {rev.flags > 0 && (
                              <div className="absolute -top-2 md:-top-3 -right-2 md:-right-3 px-3 md:px-4 py-1 rounded-full bg-danger text-[var(--foreground)] text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-glow-purple italic">
                                 {rev.flags} ANOMALIES DETECTED
                              </div>
                           )}
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </div>
      </div>
    </div>
  
  );
}
