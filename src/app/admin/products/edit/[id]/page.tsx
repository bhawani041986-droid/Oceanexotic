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
  Info,
  ShieldCheck,
  Star,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Anchor,
  Loader2,
  RefreshCw,
  X,
  Zap,
  TrendingUp,
  Heart,
  Plus,
  Clock,
  Package,
  GripVertical
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/constants/categories";

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

export default function AdminEditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sellers, setSellers] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    seller_id: "",
    price: "",
    description: "",
    stock: "",
    unit: "KG (KILOGRAMS)",
    min_order: "1",
    image_url: "",
    gallery: "[]",
    status: "ACTIVE",
    quality_rank: "VERIFIED",
    is_live_inventory: 0,
    harbor_node: "Phoenix Bay Harbor",
    catch_date: "",
    batch_label: "MORNING",
    catch_time: "05:30",
    nutrition: {
      protein: "20g",
      omega3: "300mg",
      calories: "100 kcal",
      fat: "2g"
    },
    cut_options: [],
    prep_options: [],
    location_overrides: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [territories, setTerritories] = useState<any[]>([]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch("/api/admin/get_sellers");
        const data = await res.json();
        const formattedSellers = data.map((s: any) => ({
          id: s.id.startsWith("SEL-") ? s.id : `SEL-${s.id}`,
          name: s.name
        }));
        setSellers(formattedSellers.length > 0 ? formattedSellers : [{ id: 'SEL-USR-1778761853233', name: 'Rig Fishing Haddo' }]);
      } catch (err) {}
    };

    const fetchProduct = async () => {
      try {
        // Fetch territories to build all location overrides
        const terrRes = await fetch("/api/system/get_territories");
        const terrData = terrRes.ok ? await terrRes.json() : [];
        const activeTerrs = terrData.filter((t: any) => t.zone_type !== 'ISLAND' && t.status === 'ACTIVE');
        setTerritories(activeTerrs);

        const res = await fetch(`/api/seller/products?id=${params.id}`);
        const data = await res.json();
        
        // Handle nested JSON fields
        const nutrition = data.nutrition ? (typeof data.nutrition === 'string' ? JSON.parse(data.nutrition) : data.nutrition) : {
          protein: "20g", omega3: "300mg", calories: "100 kcal", fat: "2g"
        };
        
        const dbOverrides = data.location_overrides || [];
        const mergedOverrides = activeTerrs.map((t: any) => {
          const existing = dbOverrides.find((o: any) => o.territory_name === t.name);
          return {
            territory_name: t.name,
            price: existing ? (existing.price !== null ? String(existing.price) : "") : "",
            stock: existing ? (existing.stock !== null ? String(existing.stock) : "") : "",
            is_visible: existing ? Number(existing.is_visible) : 1,
            status: existing ? existing.status : "ACTIVE"
          };
        });

        const dbPrepOptions = data.prep_options || [];
        const defaultPrepTypes = ['RAW', 'FRIED', 'MARINATED', 'GRILLED'];
        const mergedPrep = defaultPrepTypes.map((type) => {
          const existing = dbPrepOptions.find((p: any) => p.prep_type === type);
          const defaultNames = {
            'RAW': 'Raw / Cleaned',
            'FRIED': 'Chettinad Fry Masala',
            'MARINATED': 'Classic Tandoori Marinade',
            'GRILLED': 'Charcoal Grill Garlic Butter Rub'
          };
          const defaultPrices = { 'RAW': 0, 'FRIED': 50, 'MARINATED': 80, 'GRILLED': 100 };
          return {
            prep_type: type,
            name: existing ? existing.name : defaultNames[type as keyof typeof defaultNames],
            price_flat_add: existing ? Number(existing.price_flat_add) : defaultPrices[type as keyof typeof defaultPrices],
            is_available: existing ? Number(existing.is_available) : 1
          };
        });

        setFormData({
          id: data.id || "",
          name: data.name || "",
          category: data.category || "SEAWATER FISH",
          seller_id: data.seller_id || "",
          price: data.price || "",
          description: data.description || "",
          stock: data.stock || "",
          unit: data.unit || "KG (KILOGRAMS)",
          min_order: data.min_order || "1",
          image_url: data.image_url || "",
          gallery: data.gallery || "[]",
          status: data.status || "ACTIVE",
          quality_rank: data.quality_rank || "VERIFIED",
          harbor_node: data.harbor_node || "Phoenix Bay Harbor",
          catch_date: data.catch_date || "",
          nutrition: {
            protein: nutrition.protein || "",
            omega3: nutrition.omega3 || "",
            calories: nutrition.calories || "",
            fat: nutrition.fat || ""
          },
          cut_options: (data.cut_options || []).map((cut: any) => ({
            ...cut,
            cut_type: cut.cut_type || "WHOLE",
            price_modifier_percent: cut.price_modifier_percent ?? 0,
            price_flat_add: cut.price_flat_add ?? 0,
            is_available: cut.is_available ?? 1
          })),
          is_live_inventory: Number(data.is_live_inventory) || 0,
          catch_time: data.freshness_timestamp ? data.freshness_timestamp.split(' ')[1].substring(0, 5) : "05:30",
          batch_label: data.batch_label || "MORNING",
          location_overrides: mergedOverrides,
          prep_options: mergedPrep
        });
      } catch (err) {
        toast("Registry Retrieval Failure", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
    if (params.id) fetchProduct();
  }, [params.id, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast("Syncing Asset...", "info");
      const uploadData = new FormData();
      uploadData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        const data = await res.json();
        setFormData((prev: any) => ({ ...prev, image_url: data.url }));
        toast("Asset synchronized.", "success");
      } catch (err) {
        toast("Sync Failure", "error");
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast(`Commissioning ${files.length} assets...`, "info");
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const uploadData = new FormData();
        uploadData.append("file", files[i]);
        try {
          const response = await fetch("/api/upload", { method: "POST", body: uploadData });
          const data = await response.json();
          if (data.url) newUrls.push(data.url);
        } catch (err) {}
      }
      if (newUrls.length > 0) {
        setFormData((prev: any) => {
          const current = getGalleryArray(prev.gallery);
          return {
            ...prev,
            gallery: JSON.stringify([...current, ...newUrls])
          };
        });
        toast("Gallery synchronized.", "success");
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev: any) => {
      const current = getGalleryArray(prev.gallery);
      const updated = current.filter((_, idx) => idx !== index);
      return {
        ...prev,
        gallery: JSON.stringify(updated)
      };
    });
    toast("Gallery asset removed.", "success");
  };

  const getGalleryArray = (galleryVal: any): string[] => {
    if (!galleryVal) return [];
    if (Array.isArray(galleryVal)) return galleryVal;
    try {
      const parsed = JSON.parse(galleryVal);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const addCutOption = () => {
    setFormData((prev: any) => ({
      ...prev,
      cut_options: [...prev.cut_options, { cut_type: 'WHOLE', price_modifier_percent: 0, price_flat_add: 0, is_available: 1 }]
    }));
  };

  const removeCutOption = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      cut_options: prev.cut_options.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/seller/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast("Sovereign Registry Synchronized.", "success");
        router.push("/admin/products");
      } else {
        throw new Error("Sync Failure");
      }
    } catch (err) {
      toast("Registry update failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="space-y-12 animate-fade-in pb-20" style={{ color: 'var(--agent-text)' }}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <input type="file" ref={galleryInputRef} className="hidden" multiple accept="image/*" onChange={handleGalleryUpload} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-10" style={{ borderColor: 'var(--agent-border)' }}>
        <div className="flex items-center gap-6">
          <Link href="/admin/products">
            <button className="p-3 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-all active:scale-90" style={{ borderColor: 'var(--agent-border)' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight uppercase italic flex items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[var(--agent-primary)]" /> EDIT HARVEST REGISTRY
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-60">Identity Node: {formData.id} • Last Sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3 rounded-[16px] text-white"
            style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 0 15px var(--agent-glow)` }}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? "SYNCHRONIZING..." : "COMMIT CHANGES"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity Hub */}
          <Card className="p-3 lg:p-10 space-y-4 lg:space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center gap-2 border-b pb-3 lg:pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>01</div>
              <h3 className="text-sm lg:text-lg font-bold tracking-tight uppercase">Identity Hub</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Harvest Name</label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-[52px] rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary italic">Merchant Hub</label>
                  <select value={formData.seller_id} onChange={(e) => setFormData({...formData, seller_id: e.target.value})} className="w-full h-[52px] border rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest outline-none border-primary/20 transition-all shadow-glow-purple/5" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }}>
                     {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Category Registry</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-[52px] border rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                     {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.id}</option>
                     ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Base Price (/kg)</label>
                  <Input value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} type="number" className="h-[52px] rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Inventory Telemetry */}
          <Card className="p-10 space-y-8 border bg-bg-secondary/40 border-[var(--foreground)]/5 shadow-premium">
            <div className="flex items-center gap-4 border-b border-[var(--foreground)]/5 pb-6">
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>02</div>
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
                <label htmlFor="is_live" className="text-[10px] font-black uppercase tracking-widest text-primary italic cursor-pointer">Synchronize with Today's Catch Registry</label>
              </div>

              {Number(formData.is_live_inventory) === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary flex items-center gap-2">
                         <Anchor className="w-3 h-3" /> Harbor Node Registry
                      </label>
                      <select value={formData.harbor_node} onChange={(e) => setFormData({...formData, harbor_node: e.target.value})} className="w-full h-[52px] border rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest outline-none border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }}>
                         <option value="Phoenix Bay Harbor">Phoenix Bay Harbor</option>
                         <option value="Aberdeen Bazaar Jetty">Aberdeen Bazaar Jetty</option>
                         <option value="Haddo Wharf">Haddo Wharf</option>
                         <option value="Junglighat Pier">Junglighat Pier</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Harvest Batch</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['MORNING', 'AFTERNOON', 'EVENING'].map(b => (
                          <button 
                            key={b} 
                            onClick={() => setFormData({...formData, batch_label: b})}
                            className={cn(
                              "h-12 rounded-lg text-[9px] font-black border transition-all",
                              formData.batch_label === b ? "bg-primary border-primary text-white" : "border-primary/20 text-primary hover:bg-primary/5"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Catch Date</label>
                      <Input type="date" value={formData.catch_date} onChange={(e) => setFormData({...formData, catch_date: e.target.value})} className="h-[52px] rounded-[16px] border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Harvest Time (IST)
                      </label>
                      <Input type="time" value={formData.catch_time} onChange={(e) => setFormData({...formData, catch_time: e.target.value})} className="h-[52px] rounded-[16px] border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Yield & Cut Registry */}
          <Card className="p-10 space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center justify-between border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>03</div>
                <h3 className="text-lg font-bold tracking-tight uppercase">Yield & Cut Registry</h3>
              </div>
              <Button onClick={addCutOption} variant="ghost" className="text-[10px] font-black text-primary border border-primary/20 h-10">
                <Plus className="w-4 h-4 mr-2" /> ADD CUT OPTION
              </Button>
            </div>

            <div className="space-y-4">
              {formData.cut_options.map((cut: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-bg-primary/40 border border-[var(--agent-border)] rounded-2xl group relative">
                   <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40"><GripVertical className="w-5 h-5" /></div>
                   <div className="flex-1 w-full">
                      <select 
                        value={cut.cut_type} 
                        onChange={(e) => {
                          const newCuts = [...formData.cut_options];
                          newCuts[idx].cut_type = e.target.value;
                          setFormData({...formData, cut_options: newCuts});
                        }}
                        className="w-full h-12 bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none"
                      >
                        {CUT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                      </select>
                   </div>
                   <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={cut.price_modifier_percent} 
                          onChange={(e) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_modifier_percent = e.target.value;
                            setFormData({...formData, cut_options: newCuts});
                          }}
                          className="w-28 h-12 pr-8 text-xs font-black text-right" 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">%</span>
                      </div>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={cut.price_flat_add} 
                          onChange={(e) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_flat_add = e.target.value;
                            setFormData({...formData, cut_options: newCuts});
                          }}
                          className="w-28 h-12 pl-8 text-xs font-black" 
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">₹</span>
                      </div>
                      <button onClick={() => removeCutOption(idx)} className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              ))}
              {formData.cut_options.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[var(--agent-border)] rounded-[32px] opacity-40">
                  <Package className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No cut options in registry</p>
                </div>
              )}
            </div>
          </Card>

          {/* STEP 04: LOCATION OVERRIDE REGISTRY */}
          <Card className="p-10 space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center gap-2 border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>04</div>
              <Anchor className="w-4 h-4 text-[var(--agent-primary)]" />
              <h3 className="text-lg font-bold tracking-tight uppercase">Location Override Registry</h3>
            </div>
            
            <div className="space-y-4">
              {formData.location_overrides?.map((ov: any, idx: number) => (
                <div key={idx} className="p-4 bg-bg-primary/40 border border-[var(--agent-border)] rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-primary truncate">{ov.territory_name}</p>
                    <p className="text-[8px] font-bold text-text-secondary uppercase mt-0.5">Location Override Node</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Override Price */}
                    <div className="relative w-28">
                      <Input 
                        type="number" 
                        placeholder="Overr. Price"
                        value={ov.price} 
                        onChange={(e) => {
                          const newOvs = [...formData.location_overrides];
                          newOvs[idx].price = e.target.value;
                          setFormData({...formData, location_overrides: newOvs});
                        }}
                        className="h-12 text-xs pl-8 font-black" 
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">₹</span>
                    </div>

                    {/* Override Stock */}
                    <div className="relative w-24">
                      <Input 
                        type="number" 
                        placeholder="Stock"
                        value={ov.stock} 
                        onChange={(e) => {
                          const newOvs = [...formData.location_overrides];
                          newOvs[idx].stock = e.target.value;
                          setFormData({...formData, location_overrides: newOvs});
                        }}
                        className="h-12 text-xs pl-8 font-black" 
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">kg</span>
                    </div>

                    {/* Override Status */}
                    <select 
                      value={ov.status}
                      onChange={(e) => {
                        const newOvs = [...formData.location_overrides];
                        newOvs[idx].status = e.target.value;
                        setFormData({...formData, location_overrides: newOvs});
                      }}
                      className="h-12 border rounded-xl px-3 text-xs font-black uppercase tracking-widest outline-none"
                      style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMING_SOON">COMING SOON</option>
                      <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                    </select>

                    {/* Visibility Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={Number(ov.is_visible) === 1}
                        onChange={(e) => {
                          const newOvs = [...formData.location_overrides];
                          newOvs[idx].is_visible = e.target.checked ? 1 : 0;
                          setFormData({...formData, location_overrides: newOvs});
                        }}
                        className="w-5 h-5 rounded border-primary bg-bg-primary accent-primary"
                      />
                      <span className="text-xs font-black uppercase text-text-secondary">Visible</span>
                    </label>
                  </div>
                </div>
              ))}
              {(!formData.location_overrides || formData.location_overrides.length === 0) && (
                <p className="text-xs font-black uppercase opacity-40 italic text-center">Loading delivery zones...</p>
              )}
            </div>
          </Card>

          {/* STEP 05: PREPARATION & CUSTOMIZATION SERVICES */}
          <Card className="p-10 space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center gap-2 border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>05</div>
              <Fish className="w-4 h-4 text-[var(--agent-primary)]" />
              <h3 className="text-lg font-bold tracking-tight uppercase">Preparation & Cooking Customizations</h3>
            </div>
            
            <div className="space-y-4">
              {formData.prep_options?.map((prep: any, idx: number) => (
                <div key={idx} className="p-4 bg-bg-primary/40 border border-[var(--agent-border)] rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black uppercase tracking-wider text-primary">{prep.name}</span>
                    <p className="text-[8px] font-bold text-text-secondary uppercase mt-0.5">Prep Style: {prep.prep_type}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Custom Label */}
                    <div className="flex-1 md:w-60">
                      <Input 
                        type="text" 
                        placeholder="Prep Display Name"
                        value={prep.name}
                        onChange={(e) => {
                          const newPreps = [...formData.prep_options];
                          newPreps[idx].name = e.target.value;
                          setFormData({...formData, prep_options: newPreps});
                        }}
                        className="h-12 text-xs font-black" 
                      />
                    </div>

                    {/* Price flat add */}
                    <div className="relative w-28">
                      <Input 
                        type="number" 
                        placeholder="Extra price"
                        value={prep.price_flat_add} 
                        onChange={(e) => {
                          const newPreps = [...formData.prep_options];
                          newPreps[idx].price_flat_add = e.target.value;
                          setFormData({...formData, prep_options: newPreps});
                        }}
                        className="h-12 text-xs pl-8 font-black" 
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">+₹</span>
                    </div>

                    {/* Availability checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={Number(prep.is_available) === 1}
                        onChange={(e) => {
                          const newPreps = [...formData.prep_options];
                          newPreps[idx].is_available = e.target.checked ? 1 : 0;
                          setFormData({...formData, prep_options: newPreps});
                        }}
                        className="w-5 h-5 rounded border-primary bg-bg-primary accent-primary"
                      />
                      <span className="text-xs font-black uppercase text-text-secondary">Available</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="p-8 space-y-6 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <h3 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Visual Registry</h3>
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-4 group hover:border-primary/50 transition-all cursor-pointer overflow-hidden relative"
                style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)' }}
              >
                {formData.image_url ? (
                  <div className="w-full h-full relative group">
                    <img src={formData.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev: any) => ({ ...prev, image_url: "" }));
                        toast("Primary image removed.", "success");
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Click to Upload</p>
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                  {getGalleryArray(formData.gallery).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--agent-border)]">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => galleryInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-all">
                    <Plus className="w-5 h-5 text-primary opacity-40" />
                  </button>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
             <div className="flex items-center gap-2 border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black" style={{ backgroundColor: 'var(--agent-primary)30', color: 'var(--agent-primary)' }}>04</div>
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm lg:text-lg font-bold tracking-tight uppercase">Scientific Intelligence</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'protein', label: 'Protein', icon: <TrendingUp className="w-3 h-3" /> },
                  { key: 'omega3', label: 'Omega-3', icon: <Heart className="w-3 h-3" /> },
                  { key: 'calories', label: 'Calories', icon: <Zap className="w-3 h-3" /> },
                  { key: 'fat', label: 'Healthy Fat', icon: <Fish className="w-3 h-3" /> }
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">{item.icon} {item.label}</label>
                    <Input 
                      value={formData.nutrition[item.key]} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        nutrition: { ...formData.nutrition, [item.key]: e.target.value }
                      })} 
                      className="h-10 text-[10px] font-black" 
                      style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}
                    />
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-8 space-y-6 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <h4 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Governance</h4>
              <div className="space-y-4">
                 {[
                   { id: 'ELITE', label: 'ELITE HARVEST', icon: <Star className="w-4 h-4" /> },
                   { id: 'VERIFIED', label: 'VERIFIED GRADE', icon: <CheckCircle2 className="w-4 h-4" /> },
                 ].map((rank) => (
                    <button 
                      key={rank.id} 
                      onClick={() => setFormData({ ...formData, quality_rank: rank.id })}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                        formData.quality_rank === rank.id ? "border-primary bg-primary/5" : "border-[var(--agent-border)]"
                      )}
                    >
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", formData.quality_rank === rank.id ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                          {rank.icon}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{rank.label}</p>
                    </button>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
