"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ChevronLeft, 
  Upload, 
  Save, 
  Fish, 
  Tag, 
  Layers, 
  ShieldCheck,
  Star,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Anchor,
  Loader2,
  RefreshCw,
  X,
  Rocket,
  Zap,
  TrendingUp,
  Heart,
  Plus,
  Clock,
  ChevronRight,
  GripVertical,
  Package
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const CUT_TYPES = [
  { id: 'WHOLE', label: 'Whole Fish' },
  { id: 'CURRY_CUT', label: 'Curry Cut' },
  { id: 'STEAK_CUT', label: 'Steak Cut' },
  { id: 'FILLET', label: 'Fillet' },
  { id: 'CLEANED', label: 'Cleaned' },
  { id: 'UNCLEANED', label: 'Uncleaned' },
  { id: 'HEAD_ON', label: 'Head On' },
  { id: 'HEAD_OFF', label: 'Head Off' },
  { id: 'SKIN_ON', label: 'Skin On' },
  { id: 'SKIN_OFF', label: 'Skin Off' }
];

export default function SellerNewProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: `PRD-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    name: "",
    category: "PREMIUM SAKU",
    price: "",
    description: "",
    stock: "100",
    unit: "KG",
    image_url: "",
    status: "ACTIVE",
    quality_rank: "VERIFIED",
    is_live_inventory: 1,
    harbor_node: "Phoenix Bay Harbor",
    catch_date: new Date().toISOString().split('T')[0],
    batch_label: "MORNING",
    catch_time: "05:30",
    gallery: "[]",
    nutrition: {
      protein: "20g",
      omega3: "300mg",
      calories: "100 kcal",
      fat: "2g"
    },
    cut_options: [
      { cut_type: 'WHOLE', price_modifier_percent: 0, price_flat_add: 0, is_available: 1 },
      { cut_type: 'CURRY_CUT', price_modifier_percent: 10, price_flat_add: 0, is_available: 1 }
    ]
  });

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast("Syncing Asset...", "info");
      const uploadData = new FormData();
      uploadData.append("file", file);
      try {
        const response = await fetch("/api/upload", { method: "POST", body: uploadData });
        const data = await response.json();
        if (data.url) {
          setFormData((prev: any) => ({ ...prev, image_url: data.url }));
          toast("Asset synchronized.", "success");
        }
      } catch (err) {
        toast("Sync Failure", "error");
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentGallery = JSON.parse(formData.gallery || "[]");
      for (let i = 0; i < files.length; i++) {
        const uploadData = new FormData();
        uploadData.append("file", files[i]);
        try {
          const res = await fetch("/api/upload", { method: "POST", body: uploadData });
          const data = await res.json();
          if (data.url) currentGallery.push(data.url);
        } catch (err) {}
      }
      setFormData((prev: any) => ({ ...prev, gallery: JSON.stringify(currentGallery) }));
      toast("Gallery registry synchronized.", "success");
    }
  };

  const addCutOption = () => {
    setFormData((prev: any) => ({
      ...prev,
      cut_options: [...prev.cut_options, { cut_type: 'STEAK_CUT', price_modifier_percent: 0, price_flat_add: 0, is_available: 1 }]
    }));
  };

  const removeCutOption = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      cut_options: prev.cut_options.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast("Missing Identity Nodes", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, seller_id: 'SEL-001' })
      });
      if (res.ok) {
        toast("Harvest successfully commissioned!", "success");
        router.push("/seller/products");
      } else {
        toast("Registry handshake failed.", "error");
      }
    } catch (error) {
      toast("Technical disruption.", "error");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-4 lg:space-y-12 max-w-6xl mx-auto px-1.5 lg:px-0 pb-32 animate-fade-in" style={{ color: 'var(--agent-text)' }}>
      <input type="file" ref={mainInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <input type="file" ref={galleryInputRef} className="hidden" multiple accept="image/*" onChange={handleGalleryUpload} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-6">
        <div className="flex items-center gap-2 lg:gap-6">
          <button onClick={() => router.back()} className="p-2 lg:p-3 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-all active:scale-90" style={{ borderColor: 'var(--agent-border)' }}>
            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div className="space-y-0.5 lg:space-y-1">
            <h2 className="text-lg lg:text-2xl font-bold tracking-tight uppercase italic flex items-center gap-3">
              <Rocket className="w-5 h-5 lg:w-7 lg:h-7 text-[var(--agent-primary)]" /> Commission New Harvest
            </h2>
            <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-60">Sovereign Registry Initialization • Real-Time Inventory Node</p>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3 rounded-[16px] text-white"
            style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 0 15px var(--agent-glow)` }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {isSaving ? "COMMISSIONING..." : "PUBLISH HARVEST"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-12">
        <div className="lg:col-span-2 space-y-4 lg:space-y-8">
          
          {/* STEP 01: IDENTITY */}
          <Card className="p-3 lg:p-10 space-y-4 lg:space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center gap-2 border-b pb-3 lg:pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>01</div>
              <h3 className="text-sm lg:text-lg font-bold tracking-tight uppercase">Harvest Identity</h3>
            </div>
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6">
                <div className="space-y-1 lg:space-y-2">
                  <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1">Harvest Name</label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Surmai / Seer Fish" className="h-[44px] lg:h-[52px] rounded-[12px] lg:rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1">Price (/kg)</label>
                  <Input value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" type="number" className="h-[44px] lg:h-[52px] rounded-[12px] lg:rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6">
                <div className="space-y-1 lg:space-y-2">
                  <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1">Category Registry</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-[44px] lg:h-[52px] border rounded-[12px] lg:rounded-[16px] px-3 lg:px-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                     <option value="PREMIUM SAKU">PREMIUM SAKU</option>
                     <option value="WILD CRUSTACEANS">WILD CRUSTACEANS</option>
                     <option value="SHELLFISH ELITE">SHELLFISH ELITE</option>
                     <option value="DEEP SEA WHITEFISH">DEEP SEA WHITEFISH</option>
                  </select>
                </div>
                <div className="space-y-1 lg:space-y-2">
                   <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1">Stock Level (KG)</label>
                   <Input value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="100" className="h-[44px] lg:h-[52px] rounded-[12px] lg:rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                </div>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[100px] lg:min-h-[120px] border rounded-[12px] lg:rounded-[16px] p-3 lg:p-5 text-[11px] lg:text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}
                  placeholder="Detail the quality, source, and freshness..."
                />
              </div>
            </div>
          </Card>

          {/* STEP 02: LIVE TELEMETRY */}
          {/* STEP 02: INVENTORY TELEMETRY */}
          <Card className="p-10 space-y-8 border bg-bg-secondary/40 border-[var(--foreground)]/5 shadow-premium">
            <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase italic">Inventory Telemetry</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Current Stock (KG)</label>
                <div className="relative group">
                  <Input 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                    placeholder="0.00" 
                    type="number" 
                    className="h-[52px] rounded-[16px] pl-12 font-black italic bg-bg-primary/50 border-[var(--foreground)]/10 text-primary transition-all focus:border-primary/50" 
                  />
                  <Package className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Settlement Unit</label>
                <div className="relative group">
                  <select 
                    value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                    className="flex w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-[52px] rounded-[16px] pl-12 font-black italic bg-bg-primary/50 border-[var(--foreground)]/10 text-primary transition-all focus:border-primary/50 outline-none appearance-none"
                  >
                     <option value="KG">KG (KILOGRAMS)</option>
                     <option value="PCS">PCS (PIECES)</option>
                     <option value="PKT">PKT (PACKETS)</option>
                  </select>
                  <Tag className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest ml-1">Status Registry</label>
                <div className="relative group">
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})} 
                    className="flex w-full border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-[52px] rounded-[16px] pl-12 font-black italic bg-bg-primary/50 border-[var(--foreground)]/10 text-primary transition-all focus:border-primary/50 outline-none appearance-none"
                  >
                     <option value="ACTIVE">ACTIVE / LIVE</option>
                     <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                     <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <ShieldCheck className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--foreground)]/5">
              <div className="flex items-center gap-3 mb-6">
                <input 
                  type="checkbox" 
                  id="is_live" 
                  checked={Number(formData.is_live_inventory) === 1}
                  onChange={(e) => setFormData({...formData, is_live_inventory: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 rounded border-primary bg-bg-primary accent-primary cursor-pointer"
                />
                <label htmlFor="is_live" className="text-[10px] font-black uppercase tracking-widest text-primary italic cursor-pointer">Synchronize with Today's Live Marketplace</label>
              </div>

              {Number(formData.is_live_inventory) === 1 && (
                <div className={cn("space-y-6 animate-in fade-in slide-in-from-top-2", Number(formData.is_live_inventory) !== 1 && "opacity-40 grayscale pointer-events-none")}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-1 lg:space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1 text-primary flex items-center gap-2">
                         <Anchor className="w-3 h-3" /> Harbor Node
                      </label>
                      <select value={formData.harbor_node} onChange={(e) => setFormData({...formData, harbor_node: e.target.value})} className="w-full h-[44px] lg:h-[52px] border rounded-[12px] lg:rounded-[16px] px-3 lg:px-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }}>
                         <option value="Phoenix Bay Harbor">Phoenix Bay Harbor</option>
                         <option value="Aberdeen Bazaar Jetty">Aberdeen Bazaar Jetty</option>
                         <option value="Haddo Wharf">Haddo Wharf</option>
                         <option value="Junglighat Pier">Junglighat Pier</option>
                      </select>
                    </div>
                    <div className="space-y-1 lg:space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Harvest Batch</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['MORNING', 'AFTERNOON', 'EVENING'].map(b => (
                          <button 
                            key={b} 
                            onClick={() => setFormData({...formData, batch_label: b})}
                            className={cn(
                              "h-10 lg:h-12 rounded-lg text-[8px] lg:text-[9px] font-black border transition-all",
                              formData.batch_label === b ? "bg-primary border-primary text-white" : "border-primary/20 text-primary hover:bg-primary/5"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-1 lg:space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Catch Date</label>
                      <Input type="date" value={formData.catch_date} onChange={(e) => setFormData({...formData, catch_date: e.target.value})} className="h-[44px] lg:h-[52px] rounded-[12px] lg:rounded-[16px] border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }} />
                    </div>
                    <div className="space-y-1 lg:space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest ml-1 text-primary flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Harvest Time
                      </label>
                      <Input type="time" value={formData.catch_time} onChange={(e) => setFormData({...formData, catch_time: e.target.value})} className="h-[44px] lg:h-[52px] rounded-[12px] lg:rounded-[16px] border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* STEP 03: YIELD & CUT REGISTRY */}
          <Card className="p-3 lg:p-10 space-y-4 lg:space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center justify-between border-b pb-3 lg:pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>03</div>
                <h3 className="text-sm lg:text-lg font-bold tracking-tight uppercase">Yield & Cut Registry</h3>
              </div>
              <Button onClick={addCutOption} variant="ghost" className="text-[8px] lg:text-[10px] font-black text-primary border border-primary/20 h-8">
                <Plus className="w-3 h-3 mr-2" /> ADD CUT
              </Button>
            </div>

            <div className="space-y-3">
              {formData.cut_options.map((cut: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-bg-primary/40 border border-[var(--agent-border)] rounded-xl group relative">
                   <div className="w-full sm:flex-1">
                      <select 
                        value={cut.cut_type} 
                        onChange={(e) => {
                          const newCuts = [...formData.cut_options];
                          newCuts[idx].cut_type = e.target.value;
                          setFormData({...formData, cut_options: newCuts});
                        }}
                        className="w-full h-10 lg:h-12 bg-transparent border-none text-[10px] lg:text-xs font-black uppercase tracking-widest outline-none"
                      >
                        {CUT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                      </select>
                   </div>
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={cut.price_modifier_percent} 
                          onChange={(e) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_modifier_percent = e.target.value;
                            setFormData({...formData, cut_options: newCuts});
                          }}
                          className="w-20 h-10 lg:h-12 pr-6 text-[10px] font-black text-right" 
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">%</span>
                      </div>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          value={cut.price_flat_add} 
                          onChange={(e) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_flat_add = e.target.value;
                            setFormData({...formData, cut_options: newCuts});
                          }}
                          className="w-20 h-10 lg:h-12 pl-6 text-[10px] font-black" 
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-40">₹</span>
                      </div>
                   </div>
                   <button onClick={() => removeCutOption(idx)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
              {formData.cut_options.length === 0 && (
                <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-[var(--agent-border)] rounded-2xl opacity-40 text-center">
                  <Package className="w-8 h-8 mb-2 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No cut options defined</p>
                </div>
              )}
            </div>
          </Card>

          {/* STEP 04: SCIENTIFIC INTELLIGENCE */}
          <Card className="p-3 lg:p-10 space-y-4 lg:space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
             <div className="flex items-center gap-2 border-b pb-3 lg:pb-6" style={{ borderColor: 'var(--agent-border)' }}>
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm lg:text-lg font-bold tracking-tight uppercase">Scientific Intelligence</h3>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { key: 'protein', label: 'Protein', icon: <TrendingUp className="w-3 h-3" /> },
                  { key: 'omega3', label: 'Omega-3', icon: <Heart className="w-3 h-3" /> },
                  { key: 'calories', label: 'Calories', icon: <Zap className="w-3 h-3" /> },
                  { key: 'fat', label: 'Healthy Fat', icon: <Fish className="w-3 h-3" /> }
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <label className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">{item.icon} {item.label}</label>
                    <Input 
                      value={formData.nutrition[item.key]} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        nutrition: { ...formData.nutrition, [item.key]: e.target.value }
                      })} 
                      className="h-10 lg:h-12 text-[10px] font-black" 
                      style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}
                    />
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 lg:space-y-8">
          <Card className="p-3 lg:p-8 space-y-4 lg:space-y-6 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <h3 className="text-sm lg:text-lg font-bold tracking-tight uppercase border-b pb-3 lg:pb-6" style={{ borderColor: 'var(--agent-border)' }}>Visual Registry</h3>
            <div className="space-y-6">
              <div 
                onClick={() => mainInputRef.current?.click()}
                className="aspect-square rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center gap-2 lg:gap-4 group hover:border-primary/50 transition-all cursor-pointer overflow-hidden relative"
                style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)' }}
              >
                {formData.image_url ? (
                  <img src={formData.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 lg:w-8 lg:h-8 opacity-20" />
                    <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-40 text-center px-4">Master Visual Asset</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                  {JSON.parse(formData.gallery || "[]").map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--agent-border)]">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button onClick={() => galleryInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-all">
                    <Plus className="w-5 h-5 text-primary opacity-40" />
                  </button>
              </div>
            </div>
          </Card>

          <Card className="p-3 lg:p-8 space-y-4 lg:space-y-6 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <h4 className="text-sm lg:text-lg font-bold tracking-tight uppercase border-b pb-3 lg:pb-6" style={{ borderColor: 'var(--agent-border)' }}>Quality Governance</h4>
              <div className="space-y-3">
                 {[
                   { id: 'ELITE', label: 'ELITE HARVEST', icon: <Star className="w-3.5 h-3.5" /> },
                   { id: 'VERIFIED', label: 'VERIFIED GRADE', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                 ].map((rank) => (
                    <button 
                      key={rank.id} 
                      onClick={() => setFormData({ ...formData, quality_rank: rank.id })}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                        formData.quality_rank === rank.id ? "border-primary bg-primary/5" : "border-[var(--agent-border)]"
                      )}
                    >
                       <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", formData.quality_rank === rank.id ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                          {rank.icon}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{rank.label}</p>
                    </button>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* MOBILE BAR */}
      <div className="lg:hidden fixed bottom-24 left-0 right-0 px-4 z-50">
        <div className="max-w-md mx-auto">
          <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 rounded-[20px] text-[11px] font-black bg-primary text-white shadow-glow-purple">
            {isSaving ? "COMMISSIONING..." : "PUBLISH HARVEST"}
          </Button>
        </div>
      </div>
    </div>
  );
}
