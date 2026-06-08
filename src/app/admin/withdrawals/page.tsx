"use client"; // MARITIME REGISTRY FULLY SYNCHRONIZED

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  Clock, 
  History, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  Download,
  MoreVertical,
  Banknote,
  Globe,
  Loader2,
  RefreshCw,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function AdminWithdrawalsPage() {
  const [mounted, setMounted] = useState(false
  );
  const [withdrawals, setWithdrawals] = useState<any[]>([]
  );
  const [searchQuery, setSearchQuery] = useState(""
  );
  const [loading, setLoading] = useState(true
  );
  const [processingId, setProcessingId] = useState<number | null>(null
  );
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null
  );

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/get_all_withdrawals?t=${Date.now()}`);
      const data = await res.json(
  );
      if (Array.isArray(data)) {
        setWithdrawals(data
  );
      }
    } catch (err) {
      console.error("Ledger synchronization failure:", err
  );
    } finally {
      setLoading(false
  );
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setProcessingId(id
  );
    try {
      const res = await fetch(`${API_BASE_URL}/admin/update_withdrawal_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      }
  );
      if (res.ok) {
        fetchWithdrawals(
  );
      }
    } catch (err) {
      console.error("Status update interruption:", err
  );
    } finally {
      setProcessingId(null
  );
    }
  };

  useEffect(() => {
    setMounted(true
  );
    fetchWithdrawals(
  );
  }, []
  );

  if (!mounted) return null;

  return (

    <>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Banknote className="w-6 h-6 text-primary shadow-glow-purple" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter italic">Settlement Command</h2>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Global Yield Liquidation Governance</p>
             </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Pending Signals", value: withdrawals.filter(w => w.status === 'PENDING').length, icon: <Clock className="text-warning" />, bg: "bg-warning/5" },
             { label: "Total Settled", value: "₹" + (withdrawals.filter(w => w.status === 'SETTLED').reduce((acc, w) => acc + parseFloat(w.raw_amount), 0) / 100000).toFixed(2) + "L", icon: <CheckCircle2 className="text-success" />, bg: "bg-success/5" },
             { label: "Active Nodes", value: new Set(withdrawals.map(w => w.seller_id)).size, icon: <Globe className="text-primary" />, bg: "bg-primary/5" },
             { label: "Audit Ledger", value: withdrawals.length, icon: <History className="text-slate-400" />, bg: "bg-[var(--foreground)]/5" },
           ].map((stat, i) => (
             <Card key={i} className={cn("p-4 border-[var(--foreground)]/5 relative overflow-hidden group", stat.bg)}>
                <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   {React.cloneElement(stat.icon as React.ReactElement, { className: "w-16 h-16" })}
                </div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-center justify-between">
                   <h4 className="text-lg font-black text-[var(--foreground)] italic">{stat.value}</h4>
                   <div className="opacity-40">{stat.icon}</div>
                </div>
             </Card>
           ))}
        </div>

        {/* Search & Filter Hub */}
        <div className="flex gap-2">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH SETTLEMENT LEDGER..." 
                className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-2xl pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] outline-none focus:border-primary/50 transition-all italic"
              />
           </div>
           <Button variant="outline" className="w-12 h-12 p-0 border-[var(--foreground)]/10 rounded-2xl bg-[var(--foreground)]/5">
              <Filter className="w-5 h-5 text-slate-400" />
           </Button>
           <Button variant="outline" onClick={fetchWithdrawals} className="w-12 h-12 p-0 border-[var(--foreground)]/10 rounded-2xl bg-[var(--foreground)]/5">
              <RefreshCw className={cn("w-5 h-5 text-slate-400", loading && "animate-spin")} />
           </Button>
        </div>

        {/* Withdrawal Requests Registry */}
        <div className="space-y-4">
           {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Ledger...</p>
             </div>
           ) : withdrawals.length === 0 ? (
             <div className="py-20 text-center opacity-20 italic text-xs">No settlement requests found in the registry.</div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {withdrawals
                  .filter(w => 
                    w.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    w.display_id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((wth) => (
                    <Card key={wth.id} className="p-0 border-[var(--foreground)]/5 overflow-hidden group hover:border-primary/20 transition-all bg-white/[0.02]">
                     <div className="p-5 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                              {wth.seller_name.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="text-xs font-black text-[var(--foreground)] uppercase italic tracking-tight">{wth.seller_name}</h4>
                                 <Badge variant="glass" className="text-[7px] font-black px-1.5 h-4 border-[var(--foreground)]/10 text-slate-500">{wth.display_id}</Badge>
                              </div>
                              <p className="text-[10px] font-black text-primary italic leading-none">{wth.amount}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                              variant="outline"
                              onClick={() => setSelectedWithdrawal(wth)}
                              className="w-10 h-10 p-0 border-[var(--foreground)]/10 rounded-xl bg-[var(--foreground)]/5 hover:bg-primary/20 hover:border-primary/40 transition-all active:scale-90"
                           >
                              <Eye className="w-4 h-4 text-primary" />
                           </Button>
                           <Badge 
                              variant={wth.status === 'SETTLED' ? 'success' : wth.status === 'CANCELLED' ? 'danger' : 'warning'}
                              className="text-[8px] font-black tracking-widest uppercase px-2 h-6 shadow-glow-purple"
                           >
                              {wth.status}
                           </Badge>
                        </div>
                     </div>
                     
                     <div className="px-5 py-4 bg-[var(--foreground)]/5 border-t border-[var(--foreground)]/5 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                           <span className="text-slate-500">Destination Bank Node</span>
                           <span className="text-[var(--foreground)] italic">{wth.bank_node}</span>
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                           <span className="text-slate-500">Submission Timestamp</span>
                           <span className="text-slate-400">{wth.date}</span>
                        </div>
                     </div>

                     {wth.status === 'PENDING' || wth.status === 'PROCESSING' ? (
                       <div className="p-3 bg-[var(--foreground)]/5 border-t border-[var(--foreground)]/5 grid grid-cols-2 gap-2">
                          <Button 
                            onClick={() => handleUpdateStatus(wth.id, 'SETTLED')}
                            disabled={processingId === wth.id}
                            className="h-10 text-[9px] font-black uppercase tracking-widest bg-success/20 text-success hover:bg-success hover:text-[var(--foreground)] border-success/20 rounded-xl transition-all flex items-center gap-2"
                          >
                             {processingId === wth.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                             AUTHORIZE
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(wth.id, 'CANCELLED')}
                            disabled={processingId === wth.id}
                            className="h-10 text-[9px] font-black uppercase tracking-widest bg-danger/20 text-danger hover:bg-danger hover:text-[var(--foreground)] border-danger/20 rounded-xl transition-all flex items-center gap-2"
                          >
                             {processingId === wth.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                             TERMINATE
                          </Button>
                       </div>
                     ) : null}
                  </Card>
                ))}
             </div>
           )}
        </div>

        {/* Governance Guidelines */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-3xl space-y-3">
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h5 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Settlement Protocols</h5>
           </div>
           <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
              Authorize yield liquidations only after verifying matching maritime trade volume. SETTLED directives trigger irrevocable capital transfer via the Global Settlement Node. Audit signals are logged persistently.
           </p>
        </Card>

        {/* Settlement Intelligence Modal */}
        <AnimatePresence>
           {selectedWithdrawal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedWithdrawal(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                 />
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-bg-secondary border border-[var(--foreground)]/10 rounded-[32px] shadow-2xl overflow-hidden"
                 >
                    <div className="p-8 space-y-8">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-[20px] flex items-center justify-center text-primary">
                                <Banknote className="w-7 h-7 shadow-glow-purple" />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase italic leading-none mb-1">Settlement Dossier</h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none italic">{selectedWithdrawal.display_id}</p>
                             </div>
                          </div>
                          <Button 
                             variant="outline" 
                             onClick={() => setSelectedWithdrawal(null)}
                             className="w-10 h-10 p-0 border-[var(--foreground)]/10 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10"
                          >
                             <X className="w-5 h-5 text-slate-400" />
                          </Button>
                       </div>

                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-2xl space-y-1">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Liquid Yield</p>
                                <p className="text-xl font-black text-primary italic leading-none">{selectedWithdrawal.amount}</p>
                             </div>
                             <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-2xl space-y-1">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Signal Status</p>
                                <Badge 
                                   variant={selectedWithdrawal.status === 'SETTLED' ? 'success' : 'warning'}
                                   className="text-[9px] font-black tracking-widest uppercase px-2 h-6"
                                >
                                   {selectedWithdrawal.status}
                                </Badge>
                             </div>
                          </div>

                          <div className="space-y-4">
                             {[
                                { label: "Originating Node", value: selectedWithdrawal.seller_name, sub: selectedWithdrawal.seller_id },
                                { label: "Destination Bank", value: selectedWithdrawal.bank_node.split(' (')[0], sub: selectedWithdrawal.bank_node.split(' (')[1]?.replace(')', '') || 'Direct Transfer' },
                                { label: "Submission Hub", value: "Andaman Port Blair Mainframe", sub: selectedWithdrawal.date },
                                { label: "Encryption", value: "AES-256 Quantum Resistant", sub: "Verified Signal" },
                             ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--foreground)]/5 last:border-0">
                                   <div className="space-y-0.5">
                                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                      <p className="text-[11px] font-bold text-[var(--foreground)] uppercase italic">{item.value}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[9px] font-medium text-slate-400 italic">{item.sub}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>

                       {selectedWithdrawal.status === 'PENDING' ? (
                          <div className="grid grid-cols-2 gap-3 pt-4">
                             <Button 
                               onClick={() => {
                                 handleUpdateStatus(selectedWithdrawal.id, 'SETTLED'
  );
                                 setSelectedWithdrawal(null
  );
                               }}
                               className="h-14 text-[10px] font-black uppercase tracking-widest bg-success/20 text-success hover:bg-success hover:text-[var(--foreground)] border-success/20 rounded-2xl transition-all"
                             >
                                AUTHORIZE YIELD
                             </Button>
                             <Button 
                               onClick={() => {
                                 handleUpdateStatus(selectedWithdrawal.id, 'CANCELLED'
  );
                                 setSelectedWithdrawal(null
  );
                               }}
                               className="h-14 text-[10px] font-black uppercase tracking-widest bg-danger/20 text-danger hover:bg-danger hover:text-[var(--foreground)] border-danger/20 rounded-2xl transition-all"
                             >
                                TERMINATE SIGNAL
                             </Button>
                          </div>
                       ) : (
                          <Button 
                             onClick={() => setSelectedWithdrawal(null)}
                             className="w-full h-14 text-[10px] font-black uppercase tracking-widest shadow-glow-purple rounded-2xl"
                          >
                             CLOSE DOSSIER
                          </Button>
                       )}
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

      </div>
    </>
  
  );
}
