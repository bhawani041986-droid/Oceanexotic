"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { 
  ChevronLeft, 
  Upload, 
  Save,
  Loader2,
  Package,
  Plus,
  X,
  Layers,
  Tag,
  ShieldCheck,
  Image as ImageIcon,
  Anchor,
  Clock,
  RefreshCw,
  Zap,
  TrendingUp,
  Heart,
  Fish,
  Star,
  CheckCircle2,
  Trash2,
  GripVertical
} from "lucide-react";
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

export default function SellerEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- FORM STATE ---
  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "ACTIVE",
    image_url: "",
    gallery: "[]",
    description: "",
    is_live_inventory: 0,
    harbor_node: "Phoenix Bay Harbor",
    catch_date: "",
    batch_label: "MORNING",
    catch_time: "05:30",
    quality_rank: "VERIFIED",
    nutrition: {
      protein: "20g",
      omega3: "300mg",
      calories: "100 kcal",
      fat: "2g"
    },
    cut_options: []
  });

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const res = await fetch(`/api/seller/products.php?id=${id}`);
        const data = await res.json();
        if (data.id) {
          const nutrition = data.nutrition ? (typeof data.nutrition === 'string' ? JSON.parse(data.nutrition) : data.nutrition) : {
            protein: "20g", omega3: "300mg", calories: "100 kcal", fat: "2g"
          };
          setFormData({
            id: data.id || "",
            name: data.name || "",
            category: data.category || "SEAWATER FISH",
            seller_id: data.seller_id || "",
            price: data.price || "",
            description: data.description || "",
            stock: data.stock || "",
            unit: data.unit || "KG",
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
            batch_label: data.batch_label || "MORNING"
          });
        }
      } catch (err) {
        toast("Hydration Failure", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params?.id, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast("Syncing Asset...", "info");
      const uploadData = new FormData();
      uploadData.append("file", file);
      try {
        const response = await fetch("/api/upload", { method: "POST", body: uploadData });
        const data = await response.json();
        setFormData((prev: any) => ({ ...prev, image_url: data.url }));
        toast("Asset synchronized.", "success");
      } catch (err) {
        toast("Sync failed.", "error");
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
    setIsSaving(true);
    try {
      const res = await fetch('/api/seller/products.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast("Sovereign Registry Synchronized.", "success");
        router.push("/seller/products");
      } else {
        throw new Error("Sync Failure");
      }
    } catch (error) {
      toast("Commit Failed.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-screen flex flex-col items-center justify-center space-y-4"><Loader2 className="w-10 h-10 text-primary animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Hydrating Asset Node...</p></div>;

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
            <h2 className="text-lg lg:text-2xl font-bold tracking-tight uppercase italic">Edit {formData.name}</h2>
            <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-60">Identity Node: {formData.id}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 px-10 text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center gap-3 rounded-[16px] text-white"
          style={{ backgroundColor: 'var(--agent-primary)', boxShadow: `0 0 15px var(--agent-glow)` }}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "SYNCHRONIZING..." : "COMMIT CHANGES"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-12">
        <div className="lg:col-span-2 space-y-4 lg:space-y-8">
          <Card className="p-10 space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <h3 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Identity Hub</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Harvest Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-[52px] rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Category Registry</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-[52px] border rounded-[16px] px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}>
                     <option value="SEAWATER FISH">SEAWATER FISH</option>
                     <option value="FRESHWATER FISH">FRESHWATER FISH</option>
                     <option value="PRAWNS & SHRIMPS">PRAWNS & SHRIMPS</option>
                     <option value="CRABS & LOBSTERS">CRABS & LOBSTERS</option>
                     <option value="STEAKS & FILLETS">STEAKS & FILLETS</option>
                     <option value="EXOTIC CATCH">EXOTIC CATCH</option>
                     <option value="READY TO COOK">READY TO COOK</option>
                     <option value="COASTAL DRY FISH">COASTAL DRY FISH</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1">Base Price (/kg)</label>
                  <Input value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} type="number" className="h-[52px] rounded-[16px]" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[120px] border rounded-[16px] p-5 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }}
                />
              </div>
            </div>
          </Card>

          {/* Inventory Telemetry */}
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
                <label htmlFor="is_live" className="text-[10px] font-black uppercase tracking-widest text-primary italic cursor-pointer">Synchronize with Today's Catch Registry</label>
              </div>

              {Number(formData.is_live_inventory) === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary flex items-center gap-2">
                         <Anchor className="w-3 h-3" /> Harbor Node
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Catch Date</label>
                      <Input type="date" value={formData.catch_date} onChange={(e) => setFormData({...formData, catch_date: e.target.value})} className="h-[52px] rounded-[16px] border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Harvest Time
                      </label>
                      <Input type="time" value={formData.catch_time} onChange={(e) => setFormData({...formData, catch_time: e.target.value})} className="h-[52px] rounded-[16px] border-primary/30" style={{ backgroundColor: 'var(--agent-bg)', color: 'var(--agent-text)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-10 space-y-8 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
            <div className="flex items-center justify-between border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>
              <h3 className="text-lg font-bold tracking-tight uppercase">Yield & Cut Registry</h3>
              <Button onClick={addCutOption} variant="ghost" className="text-[10px] font-black text-primary border border-primary/20 h-10">
                <Plus className="w-4 h-4 mr-2" /> ADD CUT
              </Button>
            </div>

            <div className="space-y-4">
              {formData.cut_options.map((cut: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-bg-primary/40 border border-[var(--agent-border)] rounded-2xl group relative">
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
                   <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <Input type="number" value={cut.price_modifier_percent} onChange={(e) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_modifier_percent = e.target.value;
                            setFormData({...formData, cut_options: newCuts});
                        }} className="w-24 h-12 pr-8 text-xs font-black text-right" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">%</span>
                      </div>
                      <div className="relative">
                        <Input type="number" value={cut.price_flat_add} onChange={(e) => {
                            const newCuts = [...formData.cut_options];
                            newCuts[idx].price_flat_add = e.target.value;
                            setFormData({...formData, cut_options: newCuts});
                        }} className="w-24 h-12 pl-8 text-xs font-black" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">₹</span>
                      </div>
                      <button onClick={() => removeCutOption(idx)} className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
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
                onClick={() => mainInputRef.current?.click()} 
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
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Primary Asset</p>
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
             <h4 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Scientific Intelligence</h4>
             <div className="grid grid-cols-2 gap-4">
                {['protein', 'omega3', 'calories', 'fat'].map((k) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest opacity-60">{k}</label>
                    <Input value={formData.nutrition[k]} onChange={(e) => setFormData({...formData, nutrition: {...formData.nutrition, [k]: e.target.value}})} className="h-10 text-[10px] font-black" style={{ backgroundColor: 'var(--agent-bg)', borderColor: 'var(--agent-border)', color: 'var(--agent-text)' }} />
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-8 space-y-6 border" style={{ backgroundColor: 'var(--agent-card-bg)', borderColor: 'var(--agent-border)' }}>
              <h4 className="text-lg font-bold tracking-tight uppercase border-b pb-6" style={{ borderColor: 'var(--agent-border)' }}>Governance</h4>
              <div className="space-y-4">
                 {['ELITE', 'VERIFIED'].map((r) => (
                    <button key={r} onClick={() => setFormData({ ...formData, quality_rank: r })} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left", formData.quality_rank === r ? "border-primary bg-primary/5" : "border-[var(--agent-border)]")}>
                       <p className="text-[10px] font-black uppercase tracking-widest">{r} GRADE</p>
                    </button>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
