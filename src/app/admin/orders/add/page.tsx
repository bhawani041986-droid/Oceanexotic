"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminAddOrderPage() {
  const { toast } = useToast(
  );
  const router = useRouter(
  );
  const [isSubmitting, setIsSubmitting] = useState(false
  );

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    id: `ORD-${Math.floor(Math.random() * 10000)}`,
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    seller_name: "GLOBAL SEAFOODS (SEL-001)",
    total_amount: "",
    status: "PENDING",
    logistics_status: "OPTIMAL"
  }
  );

  const handleSave = async () => {
    if (!formData.customer_name || !formData.total_amount) {
      toast("Missing Trade Identity Nodes (Customer/Valuation)", "error"
  );
      return;
    }

    setIsSubmitting(true
  );
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }
  );

      if (res.ok) {
        toast("Trade manifest successfully synchronized with the global ledger.", "success"
  );
        router.push("/admin/orders"
  );
      } else {
        throw new Error("Registry Conflict"
  );
      }
    } catch (err) {
      toast("Commission Failed. Ledger Conflict.", "error"
  );
    } finally {
      setIsSubmitting(false
  );
    }
  };

  return (

    <div className="space-y-12 animate-fade-in pb-20" style={{ color: 'var(--agent-text)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-10" style={{ borderColor: 'var(--agent-border)' }}>
        <div className="flex items-center gap-6">
           <Link href="/admin/orders">
              <button className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-text-secondary hover:text-[var(--foreground)] transition-all" style={{ borderColor: 'var(--agent-border)' }}>
                 <ArrowLeft className="w-5 h-5" />
              </button>
           </Link>
           <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight uppercase italic" style={{ color: 'var(--agent-primary)' }}>Commission Trade</h2>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">ID: {formData.id}</p>
           </div>
        </div>
        <div className="flex gap-4">
           <Button 
             onClick={handleSave}
             disabled={isSubmitting}
             className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3 text-[var(--foreground)]"
             style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 0 15px var(--agent-glow)` }}
           >
             {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {isSubmitting ? "SYNCING..." : "COMMIT TRADE"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
           <Card className="p-10 space-y-8" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <h3 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Trade Parties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Customer Identity</label>
                    <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="e.g. Admiral Morgan" className="h-14 rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Maritime Merchant</label>
                    <select value={formData.seller_name} onChange={(e) => setFormData({...formData, seller_name: e.target.value})} className="w-full h-14 border rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                       <option value="GLOBAL SEAFOODS (SEL-001)">GLOBAL SEAFOODS (SEL-001)</option>
                       <option value="NORDIC HARVEST (SEL-002)">NORDIC HARVEST (SEL-002)</option>
                    </select>
                 </div>
              </div>
           </Card>

           <Card className="p-10 space-y-8" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <h3 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Valuation & Logistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Total Amount (₹)</label>
                    <Input value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: e.target.value})} placeholder="0.00" type="number" className="h-14 rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Logistics Node</label>
                    <select value={formData.logistics_status} onChange={(e) => setFormData({...formData, logistics_status: e.target.value})} className="w-full h-14 border rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                       <option value="OPTIMAL">OPTIMAL FLOW</option>
                       <option value="CRITICAL">CRITICAL / DELAYED</option>
                       <option value="WEATHER_LOCK">WEATHER LOCK</option>
                    </select>
                 </div>
              </div>
           </Card>
        </div>

        <div className="space-y-10">
           <Card className="p-8 space-y-6" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <h4 className="text-xs font-black uppercase tracking-widest italic border-b pb-4" style={{ borderColor: 'var(--agent-border)' }}>Trade Status</h4>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full h-12 border rounded-[14px] px-4 text-[9px] font-black uppercase tracking-widest outline-none transition-all" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                 <option value="PENDING">PENDING SETTLEMENT</option>
                 <option value="SHIPPED">SHIPPED / IN-TRANSIT</option>
                 <option value="DELIVERED">DELIVERED</option>
                 <option value="MEDIATION">TRADE MEDIATION</option>
              </select>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
