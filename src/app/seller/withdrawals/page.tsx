"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  IndianRupee, 
  ArrowUpRight, 
  History, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Globe,
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function SellerWithdrawalsPage() {
  const [mounted, setMounted] = useState(false
  );
  const [withdrawals, setWithdrawals] = useState<any[]>([]
  );
  const [stats, setStats] = useState<any[]>([]
  );
  const [loading, setLoading] = useState(true
  );
  const [submitting, setSubmitting] = useState(false
  );
  const [amount, setAmount] = useState(""
  );
  const [bankNode, setBankNode] = useState("Maritime Bank Alpha (....8821)"
  );
  
  const sellerId = "SEL-001";

  const fetchData = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/seller/get_withdrawals.php?seller_id=${sellerId}&t=${Date.now()}`),
        fetch(`${API_BASE_URL}/seller/get_stats.php?seller_id=${sellerId}&t=${Date.now()}`)
      ]
  );
      
      const wData = await wRes.json(
  );
      const sData = await sRes.json(
  );
      
      if (Array.isArray(wData)) setWithdrawals(wData
  );
      if (Array.isArray(sData)) setStats(sData
  );
    } catch (err) {
      console.error("Telemetry failure:", err
  );
    } finally {
      setLoading(false
  );
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setSubmitting(true
  );
    try {
      const res = await fetch(`${API_BASE_URL}/seller/create_withdrawal.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          amount: Number(amount),
          bank_node: bankNode
        })
      }
  );
      
      if (res.ok) {
        setAmount(""
  );
        fetchData(
  );
      }
    } catch (err) {
      console.error("Settlement interruption:", err
  );
    } finally {
      setSubmitting(false
  );
    }
  };

  useEffect(() => {
    setMounted(true
  );
    fetchData(
  );
  }, []
  );

  if (!mounted) return null;

  return (

    <div className="space-y-8 lg:space-y-12 animate-fade-in pb-32 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:border-b lg:border-[var(--foreground)]/5 lg:pb-10">
        <div className="space-y-1 text-center lg:text-left">
          <h2 className="text-2xl lg:text-3xl font-black text-[var(--foreground)] tracking-tight uppercase">Settlement Command</h2>
          <p className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Governing the Liquidation of Global Maritime Yields</p>
        </div>
        <Button className="hidden lg:flex h-14 px-10 text-[11px] font-black tracking-widest uppercase shadow-glow-purple items-center gap-3 rounded-[20px]">
          <Plus className="w-4 h-4" /> COMMISSION WITHDRAWAL
        </Button>
      </div>

      {/* Yield Dynamics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-32 lg:h-40 bg-[var(--foreground)]/5 animate-pulse rounded-[24px]" />
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.label} className="p-4 lg:p-8 space-y-3 lg:space-y-4 bg-bg-secondary/40 border-[var(--foreground)]/5 group hover:border-primary/20 transition-all rounded-[20px] lg:rounded-[24px]">
              <div className="flex items-center justify-between">
                 <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-[10px] lg:rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                   {stat.icon_type === 'rupee' && <IndianRupee className="w-4 h-4 lg:w-5 lg:h-5" />}
                   {stat.icon_type === 'clock' && <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-warning" />}
                   {stat.icon_type === 'trending' && <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-success" />}
                   {stat.icon_type === 'shield' && <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />}
                 </div>
                 <Badge variant="glass" className="text-[7px] font-black tracking-widest bg-[var(--foreground)]/5 text-text-secondary border-[var(--foreground)]/5 px-1.5 h-5">{stat.trend}</Badge>
              </div>
              <div className="space-y-0.5 lg:space-y-1">
                 <p className="text-[8px] lg:text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                 <h4 className="text-lg lg:text-2xl font-black text-[var(--foreground)] leading-none">{stat.value}</h4>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
         {/* Commission Hub Area */}
         <div className="lg:order-2 space-y-8">
            <Card className="p-6 lg:p-10 space-y-6 lg:space-y-8 bg-bg-secondary/40 border-primary/20 relative overflow-hidden group rounded-[24px] lg:rounded-[28px]">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <BarChart3 className="w-48 h-48 text-primary" />
               </div>
               <div className="space-y-1 relative z-10">
                  <h3 className="text-lg lg:text-xl font-black text-[var(--foreground)] uppercase tracking-tight leading-none">New Directive</h3>
                  <p className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Commission a new yield transfer</p>
               </div>
               
               <div className="space-y-5 lg:space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[9px] lg:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Transfer Amount</label>
                     <div className="relative">
                        <Input 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00" 
                          className="h-[52px] lg:h-[60px] pl-10 lg:pl-12 bg-bg-primary border-white/5 text-base lg:text-lg font-black text-white rounded-[16px] lg:rounded-[18px]" 
                        />
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] lg:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Destination Node</label>
                     <select 
                       value={bankNode}
                       onChange={(e) => setBankNode(e.target.value)}
                       className="w-full h-[52px] lg:h-[60px] bg-bg-primary border border-white/5 rounded-[16px] lg:rounded-[18px] px-4 lg:px-6 text-[10px] lg:text-[11px] font-bold text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                     >
                        <option value="Maritime Bank Alpha (....8821)">Maritime Bank Alpha (....8821)</option>
                        <option value="Global Trade Node (....4240)">Global Trade Node (....4240)</option>
                     </select>
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={submitting}
                    className="w-full h-14 lg:h-16 text-[10px] lg:text-[11px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-3 lg:gap-4 group rounded-[16px] lg:rounded-[18px]"
                  >
                     {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "COMMIT WITHDRAWAL"}
                     {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
               </div>
            </Card>

            <Card className="p-5 lg:p-8 bg-white/[0.02] border-[var(--foreground)]/5 space-y-3 lg:space-y-4 rounded-[20px] lg:rounded-[24px]">
               <div className="flex items-center gap-3 lg:gap-4">
                  <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-primary shadow-glow-purple" />
                  <p className="text-[9px] lg:text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">Settlement Security</p>
               </div>
               <p className="text-[8px] lg:text-[9px] text-text-secondary font-medium leading-relaxed italic">
                 Yield liquidations are processed via the Global Maritime Settlement Node with AES-256 encryption. Estimated transit: 24-48 hours.
               </p>
            </Card>
         </div>

         {/* Settlement Ledger */}
         <div className="lg:order-1 lg:col-span-2 space-y-6">
            <div className="px-1 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" /> Settlement Ledger
                </h3>
                <p className="text-[9px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">Liquidated yields record</p>
              </div>
              <Button variant="outline" size="sm" className="h-9 px-4 text-[8px] font-black uppercase tracking-widest border-[var(--foreground)]/5 rounded-[12px]">EXPORT CSV</Button>
            </div>

            {/* Mobile: Withdrawal Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {withdrawals.length === 0 && !loading && (
                <div className="text-center py-20 opacity-20 italic">No settlement directives found in the ledger.</div>
              )}
              {withdrawals.map((wth) => (
                <Card key={wth.id} className="p-5 space-y-4 rounded-[24px]">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Directive ID</p>
                      <p className="text-sm font-bold text-[var(--foreground)]">{wth.id}</p>
                    </div>
                    <Badge variant={wth.status === "SETTLED" ? "success" : "warning"} className="h-6 text-[8px] px-2 shadow-glow-purple">
                      {wth.status}
                    </Badge>
                  </div>
                  <div className="py-3 border-y border-[var(--foreground)]/5 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-text-secondary uppercase">Execution Date</p>
                      <p className="text-xs font-medium text-[var(--foreground)]">{wth.date}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[8px] font-black text-text-secondary uppercase">Amount</p>
                      <p className="text-xs font-black text-primary">{wth.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-text-secondary opacity-40" />
                    <p className="text-[9px] text-text-secondary font-medium italic">Recipient: {wth.node}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop: Withdrawal Table */}
            <Card className="hidden lg:block p-1 overflow-hidden rounded-[28px]">
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader>
                       <TableRow>
                         <TableHead className="min-w-[120px]">Directive ID</TableHead>
                         <TableHead className="min-w-[120px]">Yield Amount</TableHead>
                         <TableHead className="hidden sm:table-cell min-w-[150px]">Recipient Node</TableHead>
                         <TableHead className="min-w-[120px]">Status</TableHead>
                         <TableHead className="text-right min-w-[100px]">Date</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {withdrawals.length === 0 && !loading && (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center py-20 opacity-20 italic">No settlement directives found in the ledger.</TableCell>
                         </TableRow>
                       )}
                       {withdrawals.map((wth) => (
                         <TableRow key={wth.id} className="group">
                           <TableCell className="font-bold text-[var(--foreground)] text-sm uppercase tracking-tight">{wth.id}</TableCell>
                           <TableCell className="text-xs font-black text-[var(--foreground)]">{wth.amount}</TableCell>
                           <TableCell className="hidden sm:table-cell text-xs font-medium text-text-secondary italic">via {wth.node}</TableCell>
                           <TableCell>
                               <Badge variant={wth.status === "SETTLED" ? "success" : "warning"} className="shadow-glow-purple h-6 text-[9px] px-2">
                                   {wth.status}
                               </Badge>
                           </TableCell>
                           <TableCell className="text-right text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">
                               {wth.date}
                           </TableCell>
                         </TableRow>
                       ))}
                   </TableBody>
                 </Table>
               </div>
            </Card>
         </div>
      </div>
    </div>
  
  );
}
