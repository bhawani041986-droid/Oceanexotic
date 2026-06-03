"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { 
  Ticket, 
  Plus, 
  Search, 
  Calendar, 
  Percent, 
  BarChart3,
  Edit3,
  Trash2,
  Zap,
  Save,
  Clock,
  Eye
} from "lucide-react";

export default function AdminCouponsPage() {
  const { toast } = useToast(
  );
  const [coupons, setCoupons] = useState([
    { id: "CPN-001", code: "ADMIRAL15", type: "PERCENTAGE", value: 15, minPurchase: 1000, maxDiscount: 500, usage: "1,240/5,000", status: "ACTIVE", expiry: "2026-12-31" },
    { id: "CPN-002", code: "SAKUFRESH", type: "FIXED", value: 50, minPurchase: 500, maxDiscount: 50, usage: "842/1,000", status: "ACTIVE", expiry: "2026-10-15" },
    { id: "CPN-003", code: "WELCOME5", type: "PERCENTAGE", value: 5, minPurchase: 0, maxDiscount: 100, usage: "4,210/Unlimited", status: "ACTIVE", expiry: "" },
  ]
  );

  const [isModalOpen, setIsModalOpen] = useState(false
  );
  const [editingCoupon, setEditingCoupon] = useState<any>(null
  );
  const [viewOnly, setViewOnly] = useState(false
  );
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    limit: 1000,
    expiry: ""
  }
  );

  const openModal = (coupon?: any, isView: boolean = false) => {
    setViewOnly(isView
  );
    if (coupon) {
      setEditingCoupon(coupon
  );
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount || 0,
        limit: parseInt(coupon.usage.split('/')[1]) || 1000,
        expiry: coupon.expiry
      }
  );
    } else {
      setEditingCoupon(null
  );
      setFormData({ code: "", type: "PERCENTAGE", value: 0, minPurchase: 0, maxDiscount: 0, limit: 1000, expiry: "" }
  );
    }
    setIsModalOpen(true
  );
  };

  const handleSave = () => {
    if (!formData.code) {
      toast("Incentive code required.", "error"
  );
      return;
    }

    if (editingCoupon) {
      setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? {
        ...c,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minPurchase: formData.minPurchase,
        maxDiscount: formData.maxDiscount,
        expiry: formData.expiry,
        usage: `${c.usage.split('/')[0]}/${formData.limit}`
      } : c)
  );
      toast("Incentive Protocol updated.", "success"
  );
    } else {
      const newCoupon = {
        id: `CPN-${Math.floor(Math.random() * 1000)}`,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minPurchase: formData.minPurchase,
        maxDiscount: formData.maxDiscount,
        usage: `0/${formData.limit}`,
        status: "ACTIVE",
        expiry: formData.expiry
      };
      setCoupons(prev => [newCoupon, ...prev]
  );
      toast("New Incentive Commission deployed.", "success"
  );
    }
    setIsModalOpen(false
  );
  };

  const handleDelete = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id)
  );
    toast("Incentive Registry entry purged.", "info"
  );
  };

  return (

    <div className="space-y-[10px] md:space-y-10 pt-4 md:pt-10 pb-20 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[10px] md:gap-6 md:border-b md:border-[var(--foreground)]/5 md:pb-10">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase italic shadow-glow-purple/5">Incentive Command</h2>
          <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed italic opacity-60">Governing Global Trade Discounts & Loyalty Incentives</p>
        </div>
        <Button 
          onClick={() => openModal()}
          variant="primary" 
          className="h-10 md:h-12 px-6 md:px-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl italic"
        >
          <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" /> COMMISSION INCENTIVE
        </Button>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6">
        {[
          { label: "Active Incentives", value: coupons.length.toString(), icon: <Ticket /> },
          { label: "Total Redeemed", value: "8.4K", icon: <Zap /> },
          { label: "Revenue Influence", value: "₹420K", icon: <BarChart3 /> },
          { label: "Avg. Savings", value: "14%", icon: <Percent /> },
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

      {/* Registry Table */}
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
        <div className="hidden lg:block">
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
                {coupons.map((coupon) => (
                   <TableRow key={coupon.id} className="group/row border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/5 transition-all">
                      <TableCell>
                         <div className="space-y-0.5 md:space-y-1">
                            <p className="font-mono text-[11px] md:text-xs font-black text-primary uppercase tracking-widest italic">{coupon.code}</p>
                            <p className="text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Expiry: {coupon.expiry || "NEVER"}</p>
                         </div>
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs font-black text-text-secondary uppercase italic opacity-40">{coupon.type}</TableCell>
                      <TableCell className="font-black text-[var(--foreground)] italic text-[11px] md:text-sm tracking-tighter">
                        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}
                      </TableCell>
                      <TableCell>
                         <div className="space-y-1.5 md:space-y-2">
                            <div className="flex justify-between text-[7px] md:text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                               <span>{coupon.usage.split('/')[0]}</span>
                               <span>{coupon.usage.split('/')[1]}</span>
                            </div>
                            <div className="h-1 w-20 md:w-24 bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                               <div className="h-full bg-primary shadow-glow-purple" style={{ width: '40%' }} />
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant={coupon.status === "ACTIVE" ? "success" : "secondary"} className="uppercase text-[8px] md:text-[10px] italic px-2">
                            {coupon.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-1 md:gap-2">
                            <button onClick={() => openModal(coupon, true)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                               <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button onClick={() => openModal(coupon)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                               <Edit3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                            <button onClick={() => handleDelete(coupon.id)} className="p-2 md:p-2.5 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                               <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            </button>
                         </div>
                      </TableCell>
                   </TableRow>
                ))}
             </TableBody>
          </Table>
        </div>

        {/* Mobile view cards - visible only on lg screens and below */}
        <div className="lg:hidden space-y-4 p-4">
          {coupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className="p-4 rounded-xl bg-bg-secondary/45 border border-[var(--foreground)]/5 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-mono text-sm font-black text-primary uppercase tracking-widest italic">{coupon.code}</p>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">Expiry: {coupon.expiry || "NEVER"}</p>
                  <Badge variant={coupon.status === "ACTIVE" ? "success" : "secondary"} className="uppercase text-[8px] italic px-2 mt-1">
                    {coupon.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-black text-[var(--foreground)] italic text-sm tracking-tighter">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}
                  </p>
                  <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60 block mt-1">
                    {coupon.type}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t border-[var(--foreground)]/5 pt-2">
                <div className="flex justify-between text-[8px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">
                  <span>Redeemed: {coupon.usage.split('/')[0]}</span>
                  <span>Limit: {coupon.usage.split('/')[1]}</span>
                </div>
                <div className="h-1 w-full bg-[var(--foreground)]/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary shadow-glow-purple" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[var(--foreground)]/5 pt-2.5">
                <span className="text-[8px] font-mono font-bold text-text-secondary uppercase tracking-widest">ID: {coupon.id}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => openModal(coupon, true)} className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openModal(coupon)} className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-primary transition-all border border-[var(--foreground)]/5">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(coupon.id)} className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 text-text-secondary hover:text-danger transition-all border border-[var(--foreground)]/5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Governance Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={viewOnly ? "Incentive Intel" : editingCoupon ? "Edit Incentive Protocol" : "Deploy New Incentive"}
        description={viewOnly ? "Full telemetry of the selected incentive protocol." : "Configure maritime trade discounts and financial commissions."}
        className="md:max-w-2xl bg-bg-secondary/95 border border-primary/20 text-[var(--foreground)] shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl rounded-t-[28px] md:rounded-[28px] p-5 md:p-8"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Fleet Code</label>
              <Input 
                disabled={viewOnly}
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="e.g. ADMIRAL25" 
                className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 uppercase italic font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Incentive Type</label>
              <select 
                disabled={viewOnly}
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full h-12 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl px-4 text-xs font-black uppercase text-[var(--foreground)] outline-none focus:border-primary transition-all disabled:opacity-50"
              >
                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                <option value="FIXED">FIXED AMOUNT (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Incentive Value</label>
              <div className="relative">
                <Input 
                  disabled={viewOnly}
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                  className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 pl-10"
                />
                <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Min Purchase</label>
              <Input 
                disabled={viewOnly}
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({...formData, minPurchase: parseFloat(e.target.value)})}
                placeholder="0"
                className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Max Discount</label>
              <Input 
                disabled={viewOnly}
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({...formData, maxDiscount: parseFloat(e.target.value)})}
                placeholder="Unlimited"
                className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Usage Limit</label>
              <Input 
                disabled={viewOnly}
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}
                className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest italic">Decommission Date (Expiry)</label>
              <div className="relative">
                <Input 
                  disabled={viewOnly}
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  className="h-12 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 pl-10 uppercase"
                />
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border-[var(--foreground)]/10 text-[var(--foreground)] rounded-xl">
              {viewOnly ? "CLOSE REGISTRY" : "ABORT"}
            </Button>
            {!viewOnly && (
              <Button onClick={handleSave} variant="primary" className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest shadow-glow-purple rounded-xl flex items-center justify-center gap-3 italic">
                <Save className="w-4 h-4" /> {editingCoupon ? "COMMIT UPDATES" : "DEPLOY PROTOCOL"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  
  );
}
