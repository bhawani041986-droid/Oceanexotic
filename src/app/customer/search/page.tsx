"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Star, 
  ShieldCheck,
  ShoppingBag,
  Filter,
  CheckCircle2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { API_BASE_URL } from "@/config/api";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_RESULTS = [
  { id: "1", name: "Andaman Mud Crab", category: "Premium Crustacean", price: 3800, rating: 4.9, reviews: 124, seller: "Phoenix Bay Harvest", fresh: true, tag: "FRESH CATCH" },
  { id: "2", name: "Swaraj Dweep Reef Cod", category: "Deep Sea Fish", price: 1200, rating: 4.7, reviews: 85, seller: "Havelock Dock No.3", fresh: true, tag: "LOCAL SPECIAL" },
  { id: "3", name: "Neil Island Squids", category: "Mollusks", price: 950, rating: 5.0, reviews: 42, seller: "Shaheed Dweep Port", fresh: false, tag: "PREMIUM" },
  { id: "4", name: "Port Blair King Prawns", category: "Shellfish", price: 2200, rating: 4.8, reviews: 210, seller: "Junglighat Jetty", fresh: true, tag: "JUMBO" },
];

export default function SearchResultsPage() {
  const [searchTerm, setSearchTerm] = useState("Premium Seafood");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Seafood");

  // Cut Selection Modal State
  const [selectedProductForCut, setSelectedProductForCut] = useState<any>(null);
  const [isCutModalOpen, setIsCutModalOpen] = useState(false);
  const [cutOptions, setCutOptions] = useState<any[]>([]);
  const [isLoadingCuts, setIsLoadingCuts] = useState(false);
  const [selectedCut, setSelectedCut] = useState<any>(null);

  const cart = useCartStore();
  const { toast } = useToast();

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products/search.php?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(activeCategory)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setResults(data.results || []);
      }
    } catch (err) {
      toast("Registry Search Failure", "error");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeCategory]);

  const handleOpenCutModal = async (product: any) => {
    setSelectedProductForCut(product);
    setIsCutModalOpen(true);
    setIsLoadingCuts(true);
    setSelectedCut(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/products/cut_options.php?product_id=${product.id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCutOptions(data.cut_options || []);
        if (data.cut_options.length > 0) {
          setSelectedCut(data.cut_options.find((c: any) => c.is_available) || data.cut_options[0]);
        }
      }
    } catch (err) {
      toast("Cut Registry Handshake Failure", "error");
    } finally {
      setIsLoadingCuts(false);
    }
  };

  const handleConfirmCut = () => {
    if (!selectedCut) return;
    
    cart.addItem({
      id: `${selectedProductForCut.id}-${selectedCut.cut_type}`,
      name: `${selectedProductForCut.name} (${selectedCut.label})`,
      price: selectedCut.final_price,
      quantity: 1,
      image: selectedProductForCut.image,
      sellerName: selectedProductForCut.seller,
      sellerId: selectedProductForCut.sellerId || selectedProductForCut.seller_id || "SEL-000",
      metadata: {
        cut_type: selectedCut.cut_type,
        base_product_id: selectedProductForCut.id
      }
    });
    
    toast(`${selectedProductForCut.name} [${selectedCut.label}] added to cart`, "success");
    setIsCutModalOpen(false);
  };

  return (
    <div className="space-y-[10px] md:space-y-12 pt-4 md:pt-10 pb-10 animate-fade-in px-4 md:px-0">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[10px] md:gap-8 border-b border-[var(--foreground)]/5 pb-[10px] md:pb-10">
        <div className="space-y-2 md:space-y-4 flex-1 w-full">
          <div className="flex items-center gap-2 md:gap-3">
             <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[8px] md:text-[10px]">MARKETPLACE DISCOVERY</Badge>
             <span className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] italic">Live Registry Query</span>
          </div>
          <div className="relative group max-w-2xl">
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search database..."
              className="h-12 md:h-16 pl-12 md:pl-16 pr-6 md:pr-8 text-sm md:text-lg font-bold bg-bg-secondary border-[var(--foreground)]/5 focus:border-primary/50 transition-all rounded-lg md:rounded-[20px] italic" 
            />
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 italic">
            Matched {results.length} Premium Harvests in your sector
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-10 md:h-14 px-6 md:px-8 text-[9px] md:text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl">
            <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> REFINE FILTERS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[10px] md:gap-12">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden lg:block space-y-[10px] md:space-y-10">
          <div className="space-y-4 md:space-y-6">
             <h4 className="text-[10px] md:text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2 md:gap-3 border-b border-[var(--foreground)]/5 pb-2 md:pb-4 italic">
               <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" /> CATEGORY REGISTRY
             </h4>
             <div className="space-y-1 md:space-y-2">
                {["All Seafood", "Fresh Fish", "Shellfish", "Crustaceans", "Premium Saku", "Dried Seafood"].map((cat) => (
                   <label 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-[12px] cursor-pointer transition-all group",
                      activeCategory === cat ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-[var(--foreground)]/5"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[6px] border transition-all",
                      activeCategory === cat ? "border-primary bg-primary" : "border-[var(--foreground)]/20 group-hover:border-primary"
                    )} />
                    <span className={cn(
                      "text-[10px] md:text-xs font-bold transition-all uppercase tracking-widest",
                      activeCategory === cat ? "text-primary font-black" : "text-text-secondary group-hover:text-[var(--foreground)]"
                    )}>{cat}</span>
                  </label>
                ))}
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
             <h4 className="text-[10px] md:text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2 md:gap-3 border-b border-[var(--foreground)]/5 pb-2 md:pb-4 italic">
               <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" /> QUALITY SHIELD
             </h4>
             <div className="space-y-2 md:space-y-3">
                <label className="flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-[12px] bg-primary/5 border border-primary/20 cursor-pointer">
                  <span className="text-[10px] md:text-xs font-black text-[var(--foreground)] uppercase tracking-widest">Live/Fresh Only</span>
                  <div className="w-8 md:w-10 h-5 md:h-6 bg-primary rounded-full relative p-1">
                    <div className="w-3 md:w-4 h-3 md:h-4 bg-white rounded-full translate-x-3 md:translate-x-4" />
                  </div>
                </label>
             </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[32px] bg-[var(--foreground)]/5 animate-pulse" />
            ))
          ) : results.length > 0 ? (
            results.map((product) => (
              <Card key={product.id} className="p-[4px] md:p-1 group overflow-hidden transition-all hover:border-primary/30 rounded-[20px] md:rounded-[32px]">
                <div className="relative aspect-[4/3] rounded-[16px] md:rounded-[28px] overflow-hidden bg-bg-secondary">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent opacity-60" />
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
                    <Badge variant={product.is_live ? "default" : "outline"} className="shadow-glow-purple text-[8px] md:text-[10px] uppercase">{product.tag}</Badge>
                    {product.is_live && (
                      <Badge variant="success" className="bg-success/80 backdrop-blur-md text-[7px] md:text-[8px] uppercase tracking-tighter">
                        ⚓ {product.harbor}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 z-10 flex justify-between items-end">
                     <div className="space-y-0.5 md:space-y-1">
                        <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">{product.category}</p>
                        <h4 className="text-sm md:text-xl font-bold text-[var(--foreground)] tracking-tight italic">{product.name}</h4>
                     </div>
                     <p className="text-lg md:text-2xl font-black text-[var(--foreground)] italic tracking-tighter">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-3 md:p-6 space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="flex text-primary text-[8px] md:text-[10px]">★★★★★</div>
                      <span className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest">{product.rating} RATING</span>
                    </div>
                    <p className="text-[8px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic opacity-60">via {product.seller}</p>
                  </div>
                  <div className="flex gap-[4px] md:gap-3">
                    <Button 
                      onClick={() => handleOpenCutModal(product)}
                      variant="primary" 
                      className="flex-1 h-10 md:h-12 text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-glow-purple flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" /> SELECT CUT
                    </Button>
                    <button className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[14px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center hover:bg-[var(--foreground)]/10 transition-all text-text-secondary hover:text-[var(--foreground)]">
                      <Search className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <p className="text-xl font-black text-[var(--foreground)]/40 uppercase tracking-widest italic">No Live Discovery Matches in this sector</p>
              <Button onClick={() => { setSearchTerm(""); setActiveCategory("All Seafood"); }} variant="ghost" className="text-[10px] font-black uppercase underline">Reset Query</Button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-[10px] md:pt-10 border-t border-[var(--foreground)]/5">
        <p className="text-[9px] md:text-[10px] font-black text-text-secondary uppercase tracking-widest italic">Sector 1 of 3 • {results.length} Results</p>
        <div className="flex items-center gap-1.5 md:gap-2 p-1 rounded-xl md:rounded-[14px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 shadow-premium">
          <Button variant="primary" size="sm" className="h-8 md:h-9 w-8 md:w-9 rounded-lg md:rounded-[10px] p-0 text-[9px] md:text-[10px] font-black italic">1</Button>
          <Button variant="ghost" size="sm" className="h-8 md:h-9 w-8 md:w-9 rounded-lg md:rounded-[10px] p-0 text-[9px] md:text-[10px] font-black opacity-40 hover:opacity-100 italic">2</Button>
          <Button variant="ghost" size="sm" className="h-8 md:h-9 w-8 md:w-9 rounded-lg md:rounded-[10px] p-0 text-[9px] md:text-[10px] font-black opacity-40 hover:opacity-100 italic">3</Button>
          <div className="h-4 w-px bg-[var(--foreground)]/10 mx-1 md:mx-2" />
          <Button variant="ghost" size="sm" className="h-8 md:h-9 px-3 md:px-4 text-[8px] md:text-[9px] font-black uppercase opacity-40 hover:opacity-100 italic">NEXT SIGNAL</Button>
        </div>
      </div>

      {/* CUT SELECTION MODAL */}
      <AnimatePresence>
        {isCutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCutModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-bg-primary border border-[var(--foreground)]/10 shadow-2xl rounded-[32px] overflow-hidden"
            >
              <div className="p-6 md:p-8 bg-bg-secondary/50 border-b border-[var(--foreground)]/5 flex justify-between items-center">
                <div className="space-y-1">
                  <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase">Order Customization Protocol</Badge>
                  <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] uppercase italic">{selectedProductForCut?.name}</h3>
                </div>
                <button onClick={() => setIsCutModalOpen(false)} className="w-10 h-10 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                {isLoadingCuts ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-primary uppercase animate-pulse">Syncing Cut Registry...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {cutOptions.map((cut) => (
                      <button 
                        key={cut.id}
                        disabled={!cut.is_available}
                        onClick={() => setSelectedCut(cut)}
                        className={cn(
                          "p-4 rounded-2xl border flex items-center justify-between transition-all group",
                          selectedCut?.id === cut.id ? "bg-primary/10 border-primary shadow-glow-purple" : "bg-[var(--foreground)]/5 border-transparent hover:border-[var(--foreground)]/20",
                          !cut.is_available && "opacity-40 grayscale line-through cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{cut.icon}</span>
                          <div className="text-left">
                            <p className="text-[11px] font-black uppercase text-[var(--foreground)]">{cut.label}</p>
                            <p className="text-[8px] text-text-secondary uppercase">{cut.desc}</p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-[var(--foreground)] italic">₹{cut.final_price}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="pt-6 border-t border-[var(--foreground)]/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-text-secondary uppercase">Commission Total</p>
                    <p className="text-2xl font-black text-primary italic">₹{selectedCut?.final_price || 0}</p>
                  </div>
                  <Button 
                    onClick={handleConfirmCut}
                    disabled={!selectedCut}
                    className="h-14 px-10 bg-primary text-[var(--foreground)] font-black uppercase tracking-widest rounded-xl shadow-glow-purple"
                  >
                    Confirm & Commission
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  
  );
}
