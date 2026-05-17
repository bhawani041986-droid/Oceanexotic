"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  ArrowLeft, 
  Save, 
  Truck, 
  Package, 
  ShieldCheck, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  Droplets,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminEditOrderPage() {
  const { toast } = useToast(
  );
  const router = useRouter(
  );
  const params = useParams(
  );
  const orderId = params?.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false
  );
  const [isHydrating, setIsHydrating] = useState(true
  );
  const [orderData, setOrderData] = useState<any>(null
  );
  const [trackingData, setTrackingData] = useState<any>(null
  );

  // --- REGISTRY HYDRATION ---
  const fetchOrderNode = useCallback(async () => {
    if (!orderId) return;
    try {
      const [oRes, tRes] = await Promise.all([
        fetch(`/api/admin/orders?id=${orderId}`),
        fetch(`/api/fleet?order_id=${orderId}`)
      ]
  );
      const oData = await oRes.json(
  );
      const tData = await tRes.json(
  );
      if (oData) {
        const normalizedOData = Object.keys(oData).reduce((acc: any, key) => {
          acc[key] = oData[key] === null ? "" : oData[key];
          return acc;
        }, {});
        setOrderData(normalizedOData);
      }
      if (tData) {
        const normalizedTData = Object.keys(tData).reduce((acc: any, key) => {
          acc[key] = tData[key] === null ? "" : tData[key];
          return acc;
        }, {});
        setTrackingData(normalizedTData);
      }
    } catch (err) {
      toast("Hydration Failure", "error"
  );
    } finally {
      setIsHydrating(false
  );
    }
  }, [orderId]
  );

  useEffect(() => {
    fetchOrderNode(
  );
  }, [fetchOrderNode]
  );

  const handleSave = async () => {
    setIsSubmitting(true
  );
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }
  );
      if (res.ok) {
        toast("Trade manifest synchronized.", "success"
  );
        router.push("/admin/orders"
  );
      }
    } catch (err) {
      toast("Commit failed.", "error"
  );
    } finally {
      setIsSubmitting(false
  );
    }
  };

  const updateStatus = (status: string) => {
    setOrderData({ ...orderData, status }
  );
  };

  if (isHydrating) return (

    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Hydrating Trade Node...</p>
    </div>
  
  );

  return (

    <div className="space-y-12 animate-fade-in pb-20" style={{ color: 'var(--agent-text)' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-10" style={{ borderColor: 'var(--agent-border)' }}>
        <div className="flex items-center gap-6">
           <Link href="/admin/orders">
              <button className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-text-secondary hover:text-[var(--foreground)] transition-all" style={{ borderColor: 'var(--agent-border)' }}><ArrowLeft className="w-5 h-5" /></button>
           </Link>
           <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-4"><Activity className="w-8 h-8 text-primary" /> Track Order <span className="text-primary/60">{orderId}</span></h2>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Modifying Sovereign Dispatch Parameters</p>
           </div>
        </div>
        <Button onClick={handleSave} disabled={isSubmitting} className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3 text-[var(--foreground)]" style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 0 15px var(--agent-glow)` }}>
           {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           {isSubmitting ? "SYNCING..." : "COMMIT MODIFICATIONS"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
           <Card className="p-10 space-y-8" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}><Truck className="w-5 h-5 text-primary" /><h3 className="text-lg font-bold tracking-tight uppercase italic">Trade Intelligence</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest ml-1">Customer</label><Input value={orderData?.customer_name} readOnly className="h-14 bg-black/20 border-[var(--foreground)]/5 font-bold" style={{ borderColor: 'var(--agent-border)' }} /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest ml-1">Settlement Amount</label><Input value={orderData?.total_amount} onChange={(e) => setOrderData({...orderData, total_amount: e.target.value})} className="h-14 bg-black/20 border-[var(--foreground)]/5 font-black text-primary" style={{ borderColor: 'var(--agent-border)' }} /></div>
                 <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase tracking-widest ml-1">Logistics Status</label>
                    <select value={orderData?.logistics_status} onChange={(e) => setOrderData({...orderData, logistics_status: e.target.value})} className="w-full h-14 border rounded-[24px] px-6 text-sm font-black uppercase tracking-widest outline-none" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                       <option value="OPTIMAL">OPTIMAL FLOW</option>
                       <option value="CRITICAL">CRITICAL DELAY</option>
                       <option value="WEATHER_LOCK">WEATHER LOCK</option>
                    </select>
                 </div>
              </div>
           </Card>

           <Card className="p-10 space-y-6" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">TELEMETRY: POSITION</p>
                    <p className="text-xl font-black italic">{trackingData?.current_lat?.toFixed(4)}, {trackingData?.current_lng?.toFixed(4)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">COLD-CHAIN</p>
                    <p className="text-xl font-black text-primary italic">{trackingData?.current_temp || "-22.4"}°C</p>
                 </div>
              </div>
           </Card>
        </div>

        <div className="space-y-10">
           <Card className="p-8 space-y-6" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-primary" /><h4 className="text-xs font-black uppercase tracking-widest italic">Trade Status Governance</h4></div>
              <div className="space-y-4">
                 {[
                   { id: 'PENDING', label: 'PENDING HARVEST', icon: <Clock className="w-3.5 h-3.5" /> },
                   { id: 'SHIPPED', label: 'MARITIME DISPATCH', icon: <Zap className="w-3.5 h-3.5" /> },
                   { id: 'DELIVERED', label: 'ARRIVAL VERIFIED', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                   { id: 'MEDIATION', label: 'TRADE MEDIATION', icon: <AlertCircle className="w-3.5 h-3.5" /> },
                 ].map((status) => (
                    <button key={status.id} onClick={() => updateStatus(status.id)} className={cn("w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300 text-left", orderData?.status === status.id ? "bg-primary/10 border-primary/40 text-[var(--foreground)] shadow-glow-purple" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 opacity-40")}>
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", orderData?.status === status.id ? "bg-primary text-[var(--foreground)]" : "bg-[var(--foreground)]/5")}>{status.icon}</div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{status.label}</p>
                    </button>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  
  );
}
