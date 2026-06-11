"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { 
  Ticket, Plus, Search, Calendar, Percent, BarChart3,
  Edit3, Trash2, Zap, Save, Clock, Eye, X
} from "lucide-react";
import { FULL_API_URL as API_BASE_URL } from "@/config/api";

export default function AdminCouponsPage() {
  const { toast } = useToast();
  
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer / Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 0,
    min_purchase: 0,
    max_discount: 0,
    usage_limit: 1000,
    expiry_date: ""
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/system/coupons`);
      const data = await response.json();
      if (data.status === 'success') {
        setCoupons(data.content || []);
      }
    } catch (error) {
      console.error("Registry Fetch Failed:", error);
      toast("Failed to load incentive registry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openDrawer = (coupon?: any, isView: boolean = false) => {
    setViewOnly(isView);
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_purchase: coupon.min_purchase || 0,
        max_discount: coupon.max_discount || 0,
        usage_limit: coupon.usage_limit || 1000,
        expiry_date: coupon.expiry_date || ""
      });
    } else {
      setEditingCoupon(null);
      setFormData({ code: "", type: "PERCENTAGE", value: 0, min_purchase: 0, max_discount: 0, usage_limit: 1000, expiry_date: "" });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSave = async (forceStatus?: string) => {
    if (!formData.code) {
      toast("Incentive code required.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        status: forceStatus || (editingCoupon ? editingCoupon.status : "ACTIVE"),
        id: editingCoupon?.id
      };

      const response = await fetch(`${API_BASE_URL}/system/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        toast(editingCoupon ? "Incentive Protocol updated." : "New Incentive deployed.", "success");
        fetchCoupons();
        closeDrawer();
      } else {
        toast(data.message || "Failed to save incentive.", "error");
      }
    } catch (error) {
      console.error(error);
      toast("An error occurred during deployment.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely purge this code?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/system/coupons?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.status === 'success') {
        toast("Incentive Registry entry purged.", "info");
        fetchCoupons();
      } else {
        toast(data.message || "Failed to delete incentive.", "error");
      }
    } catch (error) {
      toast("Failed to purge code.", "error");
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await fetch(`${API_BASE_URL}/system/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast(`Incentive status changed to ${newStatus}.`, "success");
        fetchCoupons();
      }
    } catch (error) {
      toast("Status toggle failed.", "error");
    }
  };

  // Derive Stats
  const activeCount = coupons.filter(c => c.status === 'ACTIVE').length;
  const totalRedeemed = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);
  const avgSavings = coupons.filter(c => c.type === 'PERCENTAGE').reduce((sum, c) => sum + c.value, 0) / (coupons.filter(c => c.type === 'PERCENTAGE').length || 1);

  return (
    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in relative">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Incentive Command</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Global Trade Discounts & Loyalty Incentives</p>
        </div>
        <Button 
          onClick={() => openDrawer()}
          variant="primary" 
          className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
        >
          <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION INCENTIVE
        </Button>
      </div>

      {/* 2. IMPACT STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Active Incentives", value: activeCount.toString(), icon: <Ticket /> },
          { label: "Total Redeemed", value: totalRedeemed >= 1000 ? `${(totalRedeemed/1000).toFixed(1)}K` : totalRedeemed.toString(), icon: <Zap /> },
          { label: "Revenue Influence", value: "₹420K", icon: <BarChart3 /> }, // Placeholder or derived from orders eventually
          { label: "Avg. Savings", value: `${Math.round(avgSavings)}%`, icon: <Percent /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-[10px] md:p-6 space-y-3 md:space-y-4 bg-bg-secondary/20 border-[var(--foreground)]/5 rounded-[24px] md:rounded-[40px] hover:border-primary/20 transition-all group shadow-premium">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-[12px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[var(--foreground)] transition-all shadow-glow-purple/5">
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
            </div>
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[7px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">{stat.label}</p>
              <h4 className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. REGISTRY TABLE */}
      <Card className="p-1 rounded-[24px] md:rounded-[40px] overflow-hidden bg-bg-secondary/20 shadow-premium border-[var(--foreground)]/5">
        <div className="p-[10px] md:p-6 border-b border-[var(--foreground)]/5 flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6">
           <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-black text-[var(--foreground)] tracking-tighter uppercase italic">Incentive Registry</h3>
              <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Live Discount Codes & Redemptions</p>
           </div>
           <div className="relative group w-full md:w-64">
              <Input placeholder="SEARCH CODE..." className="h-10 pl-10 text-[8px] md:text-[9px] font-black uppercase italic bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-lg md:rounded-xl" />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
           </div>
        </div>
        
        <Table>
            <TableHeader>
              <TableRow className="border-[var(--foreground)]/5">
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Fleet Code</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Incentive Type</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Value</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Usage Intensity</TableHead>
                  <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Registry Status</TableHead>
                  <TableHead className="text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-text-secondary">Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-40 text-center"><div className="w-8 h-8 mx-auto border-2 border-primary/20 border-t-primary rounded-full animate-spin" /> </TableCell></TableRow>
              ) : coupons.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-40 text-center opacity-40 italic font-black uppercase tracking-widest text-xs">No incentives registered. Run SQL Script if error.</TableCell></TableRow>
              ) : coupons.map((coupon) => {
                 const usagePercent = Math.min(100, ((coupon.usage_count || 0) / (coupon.usage_limit || 1)) * 100);
                 return (
                  <TableRow key={coupon.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                    <TableCell>
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="font-mono text-[11px] md:text-xs font-black text-primary uppercase tracking-widest italic">{coupon.code}</p>
                          <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Expiry: {coupon.expiry_date || "NEVER"}</p>
                        </div>
                    </TableCell>
                    <TableCell className="text-[10px] md:text-xs font-black text-text-secondary uppercase italic opacity-40">{coupon.type}</TableCell>
                    <TableCell className="font-black text-[var(--foreground)] italic text-[11px] md:text-sm tracking-tighter">
                      {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}
                    </TableCell>
                    <TableCell>
                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex justify-between text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                              <span>{coupon.usage_count || 0}</span>
                              <span>{coupon.usage_limit || "UNL"}</span>
                          </div>
                          <div className="h-1 w-20 md:w-24 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary shadow-glow-purple" style={{ width: `${usagePercent}%` }} />
                          </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <button onClick={() => toggleStatus(coupon)} className="cursor-pointer">
                          <Badge variant={coupon.status === "ACTIVE" ? "success" : "secondary"} className={cn("uppercase text-[8px] md:text-[10px] italic px-2 transition-all", coupon.status === 'ACTIVE' ? 'shadow-glow-success' : 'opacity-40')}>
                              {coupon.status}
                          </Badge>
                        </button>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <button onClick={() => openDrawer(coupon, true)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"><Eye className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                          <button onClick={() => openDrawer(coupon)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5"><Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                          <button onClick={() => handleDelete(coupon.id)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5"><Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" /></button>
                        </div>
                    </TableCell>
                  </TableRow>
                 )
              })}
            </TableBody>
        </Table>
      </Card>

      {/* 4. GLASSMORPHIC SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={closeDrawer} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            />
            
            <motion.div 
              initial={{ x: "100%", opacity: 0.5 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: "100%", opacity: 0.5 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[500px] h-full bg-slate-900 border-l border-[var(--foreground)]/10 shadow-2xl flex flex-col z-[101]"
            >
              <div className="p-6 md:p-8 border-b border-[var(--foreground)]/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                 <div>
                    <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] uppercase italic tracking-tighter">
                      {viewOnly ? "Incentive Intel" : editingCoupon ? "Edit Protocol" : "Deploy Protocol"}
                    </h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Global Financial Governance</p>
                 </div>
                 <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-[var(--foreground)]/10 text-slate-400 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Fleet Code</label>
                       <Input disabled={viewOnly || isSaving} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. ADMIRAL25" className="h-14 bg-black/50 border-[var(--foreground)]/10 uppercase italic font-mono text-primary text-base placeholder:text-primary/20" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Incentive Type</label>
                       <select disabled={viewOnly || isSaving} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full h-14 bg-black/50 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none focus:border-primary transition-all disabled:opacity-50 cursor-pointer">
                          <option value="PERCENTAGE">PERCENTAGE (%)</option>
                          <option value="FIXED">FIXED AMOUNT (₹)</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4 p-4 rounded-2xl border border-primary/20 bg-primary/5">
                    <h4 className="text-xs font-black uppercase text-primary tracking-widest">Financial Boundaries</h4>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest">Value</label>
                          <div className="relative">
                             <Input disabled={viewOnly || isSaving} type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})} className="h-12 bg-black/50 border-primary/20 text-primary pl-8 font-mono" />
                             <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary opacity-50" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest">Min Order</label>
                          <Input disabled={viewOnly || isSaving} type="number" value={formData.min_purchase} onChange={(e) => setFormData({...formData, min_purchase: parseFloat(e.target.value)})} className="h-12 bg-black/50 border-primary/20 text-primary font-mono" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest">Max Cap</label>
                          <Input disabled={viewOnly || isSaving} type="number" value={formData.max_discount} onChange={(e) => setFormData({...formData, max_discount: parseFloat(e.target.value)})} className="h-12 bg-black/50 border-primary/20 text-primary font-mono" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Usage Limit</label>
                       <Input disabled={viewOnly || isSaving} type="number" value={formData.usage_limit} onChange={(e) => setFormData({...formData, usage_limit: parseInt(e.target.value)})} className="h-12 bg-black/50 border-[var(--foreground)]/10 font-mono" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic ml-1">Decommission (Expiry)</label>
                       <div className="relative">
                          <Input disabled={viewOnly || isSaving} type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="h-12 bg-black/50 border-[var(--foreground)]/10 pl-10 uppercase font-mono text-xs text-slate-300 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50 pointer-events-none" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 md:p-8 bg-slate-950 border-t border-[var(--foreground)]/10 flex gap-3">
                 <Button onClick={closeDrawer} variant="outline" className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/10 text-[var(--foreground)] rounded-xl">
                    {viewOnly ? "CLOSE REGISTRY" : "ABORT"}
                 </Button>
                 {!viewOnly && (
                    <Button onClick={() => handleSave()} disabled={isSaving} variant="primary" className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest shadow-glow-purple rounded-xl flex items-center justify-center gap-3 italic">
                       {isSaving ? <span className="animate-pulse">DEPLOYING...</span> : <><Save className="w-4 h-4" /> {editingCoupon ? "COMMIT UPDATES" : "DEPLOY PROTOCOL"}</>}
                    </Button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
