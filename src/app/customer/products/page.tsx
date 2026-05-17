"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  ShoppingBag, 
  Heart, 
  ArrowRight, 
  Menu, 
  X, 
  MapPin, 
  Bell, 
  User, 
  Maximize2,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Leaf,
  Info,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Smartphone,
  Mic,
  Plus,
  Minus,
  CheckCircle2,
  Globe,
  Home as HomeIcon,
  Receipt,
  MessageCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { MASTER_PRODUCT_REGISTRY } from "@/constants/products";
import { authService } from "@/services/authService";

// --- BUSINESS INTELLIGENCE DATA ---
const TICKER_ITEMS = [
  "⚡ FLASH HARVEST: Tiger Prawns from Havelock Node just arrived",
  "🚢 FLEET SYNC: Deep Sea Vessel 'Andaman Queen' docking in 20m",
  "🔥 HOT ASSET: Red Snapper demand +24% in last hour",
  "🛡️ SECURITY: Cold-chain integrity verified for all current shipments",
  "⚓ NODE UPDATE: Port Blair central hub at 98% capacity"
];

const AUTHORITY_BADGES = [
  { label: "FSSAI AUTH", icon: <ShieldCheck /> },
  { label: "ISO 22000", icon: <CheckCircle2 /> },
  { label: "COLD-CHAIN", icon: <Zap /> },
  { label: "SUSTAINABLE", icon: <Leaf /> }
];

const CULINARY_PROTOCOLS = [
  { title: "Snapper Prep", subtitle: "Chef's Protocol", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80" },
  { title: "Crustacean Storage", subtitle: "Maritime Standard", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80" }
];

// --- Sub-Components ---

const ProductCard = ({ product }: { product: any }) => {
  const [quantity, setQuantity] = React.useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem } = useCartStore();

  // --- REGISTRY SYNC (LIVE) ---
  // The product data is now managed by the parent registry fetch engine.
  const hydratedProduct = product;

  const handleAddToCart = () => {
    if (!authService.getCurrentUser()) {
      toast("Identity required. Redirecting to Login...", "error");
      router.push("/login");
      return;
    }
    addItem({
      id: hydratedProduct.id,
      name: hydratedProduct.name,
      price: hydratedProduct.price,
      image: hydratedProduct.images[0] || hydratedProduct.image,
      quantity: 1,
      sellerId: hydratedProduct.seller_id || "SEL-000"
    });
    toast(`${hydratedProduct.name} commissioned to cart.`, "success");
    setQuantity(1);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
      <Card 
        onClick={() => router.push(`/customer/products/${hydratedProduct.id}`)}
        className="relative overflow-hidden bg-[var(--c-card)] border-[var(--foreground)]/5 rounded-[calc(var(--c-radius-card)*0.5)] group-hover:border-[var(--c-primary)]/30 transition-all duration-500 shadow-xl group-hover:shadow-[var(--c-shadow-glow)] cursor-pointer"
      >
        <div className="relative aspect-[4/5] bg-[var(--c-bg-alt)] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl group-hover:scale-110 transition-transform duration-700 select-none">
              {(hydratedProduct.images?.[0]?.startsWith('http') || hydratedProduct.images?.[0]?.startsWith('/')) 
                ? <img src={hydratedProduct.images[0]} className="w-full h-full object-cover" /> 
                : (hydratedProduct.images?.[0] || hydratedProduct.image)}
            </div>
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg-alt)] via-transparent to-transparent opacity-60" />
           <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge className={cn(
                "shadow-[var(--c-shadow-glow)] text-[7px] font-black uppercase italic rounded-full border-none px-2 py-1 text-[var(--foreground)]",
                hydratedProduct.is_live_inventory == 1 ? "bg-emerald-500 animate-pulse" : "bg-[var(--c-primary)]"
              )}>
                {hydratedProduct.is_live_inventory == 1 ? "LIVE BATCH" : (hydratedProduct.badge || "PREMIUM")}
              </Badge>
              {hydratedProduct.discount && <Badge className="bg-success text-[7px] font-black uppercase italic rounded-full border-none px-2 py-1 text-white">{hydratedProduct.discount}</Badge>}
           </div>
           <button onClick={(e) => { e.stopPropagation(); toast("Added to Heart Registry.", "success"); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[var(--c-text-primary)] hover:bg-danger hover:text-white transition-all flex items-center justify-center"><Heart className="w-4 h-4" /></button>
        </div>
        <div className="p-[10px] md:p-4 space-y-[4px] md:space-y-2">
           <div className="flex justify-between items-start">
              <div className="space-y-0.5 md:space-y-1">
                 <div className="flex items-center gap-1.5">
                    <p className="text-[7px] md:text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-tighter">{hydratedProduct.seller}</p>
                    {hydratedProduct.harbor_node && hydratedProduct.harbor_node !== 'NA' && (
                        <span className="text-[6px] md:text-[7px] font-black text-primary uppercase italic">@ {hydratedProduct.harbor_node}</span>
                    )}
                 </div>
                 <h3 className="text-[10px] md:text-lg font-black text-[var(--c-text-primary)] uppercase italic leading-[1.1] group-hover:text-[var(--c-primary)] transition-colors line-clamp-1">{hydratedProduct.name}</h3>
              </div>
              <div className="flex items-center gap-1 bg-[var(--foreground)]/5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg">
                 <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-warning fill-warning" />
                 <span className="text-[10px] md:text-xs font-black text-[var(--c-text-primary)]">{hydratedProduct.rating}</span>
              </div>
           </div>
           <div className="flex items-center gap-2 md:gap-4 text-[8px] md:text-xs text-[var(--c-text-secondary)] italic">
              <div className="flex items-center gap-1">
                {hydratedProduct.is_live_inventory == 1 ? (
                    <><Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400" /> <span className="text-emerald-400">CAUGHT {hydratedProduct.catch_date}</span></>
                ) : (
                    <><Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--c-primary)]" /> {hydratedProduct.eta}</>
                )}
              </div>
              <div className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" /> {hydratedProduct.freshness}%</div>
           </div>
           <div className="flex items-center justify-between pt-1 md:pt-2">
              <div className="space-y-0.5">
                 <p className="text-[7px] md:text-[9px] font-black text-[var(--c-text-secondary)] uppercase">{hydratedProduct.weight}</p>
                 <p className="text-sm md:text-2xl font-black text-[var(--c-text-primary)] italic leading-none">₹{hydratedProduct.price.toLocaleString()}</p>
              </div>
              {quantity === 0 ? (
                <Button onClick={(e) => { e.stopPropagation(); handleAddToCart(); }} className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-[var(--c-radius-btn)] bg-[var(--c-primary)] hover:bg-[var(--c-primary-light)] shadow-[var(--c-shadow-glow)] flex items-center justify-center p-0 transition-all active:scale-90 text-[var(--foreground)]"><Plus className="w-4 h-4 md:w-6 md:h-6" /></Button>
              ) : (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center bg-[var(--foreground)]/5 rounded-lg md:rounded-[var(--c-radius-btn)] border border-[var(--foreground)]/10 overflow-hidden h-8 md:h-12">
                   <button onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(0, q - 1)); }} className="w-6 md:w-10 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--c-text-primary)]"><Minus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                   <span className="w-6 md:w-8 text-center text-[10px] md:text-xs font-black text-[var(--c-primary)]">{quantity}</span>
                   <button onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }} className="w-6 md:w-10 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--c-text-primary)]"><Plus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                </div>
              )}
           </div>
        </div>
      </Card>
    </motion.div>
  );
};

const FilterSection = ({ title, options }: { title: string, options: string[] }) => (
  <div className="space-y-4">
    <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] italic">{title}</h5>
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 group cursor-pointer">
          <div className="w-5 h-5 rounded-md border-2 border-[var(--foreground)]/10 flex items-center justify-center group-hover:border-[var(--c-primary)] transition-all group-active:scale-90">
             <div className="w-2.5 h-2.5 bg-[var(--c-primary)] rounded-[2px] opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="text-xs font-black uppercase text-[var(--c-text-secondary)] group-hover:text-[var(--c-text-primary)] transition-colors">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

const CATEGORIES = ["All Seafood", "Fresh Fish", "Shellfish", "Exotic Shellfish", "Crustaceans", "Frozen", "Value Packs", "Premium Selection"];
import { Suspense } from "react";

function ProductListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const settings = useSettingsStore();
  
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("All Seafood");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("Popularity");
  const [isScrolled, setIsScrolled] = React.useState(false);

  // --- DYNAMIC NAVIGATION ENGINE STATE ---
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // --- LIVE REGISTRY SYNC ENGINE ---
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [subscriberEmail, setSubscriberEmail] = React.useState("");
  const [isSubscribing, setIsSubscribing] = React.useState(false);

  const handleSubscribe = async () => {
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      toast("Invalid Communication Node Address", "error");
      return;
    }
    setIsSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriberEmail })
      });
      if (res.ok) {
        toast("Commission Successful. Welcome to the Fleet!", "success");
        setSubscriberEmail("");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast("Comm Link Failure", "error");
    } finally {
      setIsSubscribing(false);
    }
  };

  // --- ABSOLUTE HYDRATION & NAVIGATION SYNC ---
  React.useEffect(() => {
    setMounted(true);
    
    // Sync Category & Search from URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const matched = CATEGORIES.find(c => c.toLowerCase().includes(categoryParam.toLowerCase()));
      if (matched) setActiveTab(matched);
    }
    
    const sQuery = searchParams.get('search');
    if (sQuery) {
      setSearchQuery(sQuery);
    }
  }, [searchParams]);

  const fetchLiveRegistry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/seller/products.php');
      const data = await res.json();
      
      // Hydrate Registry with extended metadata fallbacks
      const hydrated = data.map((p: any) => {
        const fallback = MASTER_PRODUCT_REGISTRY.find(m => m.id === p.id) || MASTER_PRODUCT_REGISTRY[0];
        return {
          ...fallback,
          ...p,
          images: p.image_url ? [p.image_url] : fallback.images,
          status: p.stock <= 0 ? "OUT OF STOCK" : (p.status || "ACTIVE")
        };
      });
      
      setProducts(hydrated);
    } catch (err) {
      toast("Registry Sync Failure. Using cached fallback.", "error");
      setProducts(MASTER_PRODUCT_REGISTRY);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLiveRegistry();
  }, []);

  // --- FILTERING & PAGINATION LOGIC ---
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesTab = activeTab === "All Seafood" || p.category === activeTab;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  if (!mounted || isLoading) {
    return (
      <div className="bg-[var(--c-bg)] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 text-[var(--c-primary)] animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Trade Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1.1 LIVE HARVEST TICKER (SCARCITY & URGENCY) */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-[90] bg-[var(--c-primary)] h-8 md:h-10 flex items-center overflow-hidden border-y border-[var(--foreground)]/10">
         <div className="flex animate-marquee whitespace-nowrap gap-10 md:gap-20">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
               <span key={i} className="text-[7px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white animate-pulse" /> {item}
               </span>
            ))}
         </div>
      </div>

      {/* 3. SEARCH & FILTER HERO - RECTIFIED WATERLINE */}
      <section className="pt-[26px] md:pt-[34px] pb-2 md:pb-8">
         <div className="container mx-auto px-2 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-8 items-center">
               <div className="space-y-1 md:space-y-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5 md:space-y-2">
                     <Badge className="bg-[var(--c-primary)]/20 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[6px] md:text-[8px] font-black px-2 md:px-3 py-0.5 md:py-1 uppercase italic tracking-widest">Premium Seafood Discovery</Badge>
                     <h2 className="text-xl md:text-5xl lg:text-6xl font-black uppercase italic leading-[0.9] tracking-tighter text-[var(--c-text-primary)]">The World's <span className="text-[var(--c-primary)]">Freshest</span> <br /> Harvest Registry</h2>
                  </motion.div>
                  <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                     <div className="flex-1 relative group">
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search the database..." className="h-9 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-12 md:pr-16 text-[9px] md:text-sm italic focus:border-[var(--c-primary)] text-[var(--c-text-primary)] transition-all group-hover:bg-[var(--foreground)]/10" />
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--c-text-secondary)] group-focus-within:text-[var(--c-primary)] transition-colors" />
                     </div>
                  </div>
               </div>
               <div className="hidden lg:block relative">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 aspect-square bg-gradient-to-br from-[var(--c-primary)]/20 to-blue-500/20 rounded-[var(--c-radius-card)] flex items-center justify-center text-[12rem] shadow-[var(--c-shadow-glow)]">🦀</motion.div>
                  <div className="absolute -inset-20 bg-[var(--c-primary)]/10 blur-[120px] rounded-full animate-pulse" />
               </div>
            </div>
         </div>
      </section>

      {/* 3.1 AUTHORITY VERIFICATION (DEEP TRUST) */}
      <section className="py-1 md:py-6 border-y border-[var(--foreground)]/5 bg-[var(--foreground)]/5 backdrop-blur-md">
         <div className="container mx-auto px-2 md:px-10">
            <div className="flex items-center justify-between gap-4 md:gap-10 overflow-hidden">
               <div className="flex flex-col flex-shrink-0">
                  <span className="text-[6px] md:text-[10px] font-black text-[var(--c-primary)] uppercase tracking-widest">Authority</span>
                  <h3 className="text-[10px] md:text-xl font-black text-[var(--c-text-primary)] uppercase italic">Nodes.</h3>
               </div>
               <div className="flex items-center gap-4 md:gap-12 overflow-x-auto no-scrollbar pb-1">
                  {AUTHORITY_BADGES.map((badge, i) => (
                     <div key={i} className="flex items-center gap-1.5 md:gap-3 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 flex-shrink-0">
                        <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-[var(--c-primary)]">
                           {React.cloneElement(badge.icon as React.ReactElement, { className: "w-3 h-3 md:w-6 md:h-6" })}
                        </div>
                        <span className="text-[6px] md:text-[10px] font-black text-[var(--c-text-primary)] uppercase tracking-tighter">{badge.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 4. MAIN EXPLORER REGISTRY */}
      <section className="pb-8 md:pb-16">
         <div className="container mx-auto px-2 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-8">
               
               {/* STICKY LEFT SIDEBAR */}
               <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24 h-fit">
                  <div className="space-y-6 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 p-4 rounded-xl">
                     <h4 className="text-sm font-black uppercase italic border-b border-[var(--foreground)]/5 pb-2 text-[var(--c-text-primary)]">Filters</h4>
                     <div className="space-y-4">
                        <FilterSection title="Fish Type" options={["Live Catch", "Shellfish", "Whole Fish", "Fillets", "Value Packs"]} />
                        <FilterSection title="Fresh / Frozen" options={["Fresh Harvest", "Flash Frozen", "Chilled", "Dry Aged"]} />
                        <FilterSection title="Availability" options={["In Stock", "Out of Stock", "Coming Soon"]} />
                     </div>
                     <div className="space-y-2 pt-2 border-t border-[var(--foreground)]/5">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] italic">Price Range (₹)</h5>
                        <div className="flex items-center gap-2">
                           <Input placeholder="MIN" className="h-8 bg-[var(--c-bg)] border-[var(--foreground)]/10 rounded-lg text-[10px] text-[var(--c-text-primary)]" />
                           <span className="text-[var(--c-text-secondary)]">-</span>
                           <Input placeholder="MAX" className="h-8 bg-[var(--c-bg)] border-[var(--foreground)]/10 rounded-lg text-[10px] text-[var(--c-text-primary)]" />
                        </div>
                     </div>
                     <Button className="w-full h-10 rounded-lg bg-[var(--c-primary)] text-[var(--foreground)] font-black uppercase text-[9px] shadow-[var(--c-shadow-glow)]">Apply Protocols</Button>
                  </div>
               </aside>

               {/* MAIN GRID HUB */}
               <main className="lg:col-span-9 space-y-2 md:space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 p-2 rounded-xl backdrop-blur-md">
                     <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto">
                        {CATEGORIES.map((cat) => (
                          <button key={cat} onClick={() => setActiveTab(cat)} className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic whitespace-nowrap transition-all", activeTab === cat ? "bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)]" : "text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)] bg-[var(--foreground)]/5")}>{cat}</button>
                        ))}
                     </div>
                     <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-[var(--foreground)]/10 pt-2 md:pt-0 md:pl-6">
                        <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">Sort By:</p>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-[8px] font-black uppercase text-[var(--c-text-primary)] outline-none cursor-pointer">
                           {["Popularity", "Price: Low to High", "Price: High to Low", "Freshest"].map((opt) => (
                             <option key={opt} value={opt} className="bg-[var(--c-card)]">{opt}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 px-1">
                     <Badge className="bg-[var(--c-primary)]/10 text-[var(--c-primary)] border-[var(--c-primary)]/20 px-3 py-1 rounded-full text-[7px] font-black uppercase italic flex items-center gap-2">{activeTab} <X onClick={() => setActiveTab("All Seafood")} className="w-2 h-2 cursor-pointer" /></Badge>
                     {activeTab !== "All Seafood" && <button onClick={() => setActiveTab("All Seafood")} className="text-[7px] font-black text-[var(--c-primary)] uppercase hover:underline">Clear All</button>}
                  </div>

                  {paginatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[4px] md:gap-4">
                       {paginatedProducts.map((product) => (
                         <ProductCard key={product.id} product={product} />
                       ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-2">
                       <div className="text-4xl grayscale opacity-30">🐚</div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] italic">No assets found in this sector.</p>
                    </div>
                  )}

                  {/* DYNAMIC PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-3 md:gap-6 pt-4 md:pt-10">
                       <div className="flex items-center gap-1 md:gap-2">
                          <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-[var(--c-text-secondary)] hover:text-[var(--foreground)] disabled:opacity-20 transition-all"
                          >
                             <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                          </button>

                          {Array.from({ length: totalPages }).map((_, i) => {
                             const pageNum = i + 1;
                             // Smart Pagination: Show current, 1st, last, and neighbors
                             const isVisible = totalPages <= 5 || 
                               pageNum === 1 || 
                               pageNum === totalPages || 
                               Math.abs(pageNum - currentPage) <= 1;

                             if (!isVisible) {
                               if (pageNum === 2 || pageNum === totalPages - 1) {
                                 return <span key={i} className="text-[var(--c-text-secondary)] opacity-20 px-1">...</span>;
                               }
                               return null;
                             }

                             return (
                                <button 
                                  key={i} 
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={cn(
                                    "w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase transition-all border",
                                    currentPage === pageNum ? "bg-[var(--c-primary)] border-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)]" : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]"
                                  )}
                                >
                                  {pageNum}
                                </button>
                             );
                          })}

                          <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-center text-[var(--c-text-secondary)] hover:text-[var(--foreground)] disabled:opacity-20 transition-all"
                          >
                             <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                       </div>
                       <p className="text-[8px] md:text-[9px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.2em] italic">Sector {currentPage} of {totalPages} • {filteredProducts.length} Results</p>
                    </div>
                  )}
               </main>
            </div>
         </div>
      </section>

      {/* 4.1 CULINARY INTELLIGENCE (EDUCATIONAL CONVERSION) */}
      <section className="py-4 md:py-20 container mx-auto px-2 md:px-10">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-16 items-center">
            <div className="space-y-4 md:space-y-8">
               <div className="space-y-0.5 md:space-y-2">
                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20 text-[6px] md:text-[8px] font-black uppercase">Chef's Handshake</Badge>
                  <h2 className="text-2xl md:text-6xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.9]">Master the <br /> Harvest Protocols.</h2>
                  <p className="text-[9px] md:text-lg text-[var(--c-text-secondary)] font-medium italic max-w-md">Real-time culinary intelligence for every fleet delivery.</p>
               </div>
               <div className="grid grid-cols-2 gap-2 md:gap-4">
                  {CULINARY_PROTOCOLS.map((p, i) => (
                     <Card key={i} className="aspect-square relative overflow-hidden group cursor-pointer border-[var(--foreground)]/5">
                        <img src={p.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 right-2 md:right-3">
                           <p className="text-[6px] md:text-[7px] font-black text-amber-500 uppercase">{p.subtitle}</p>
                           <h4 className="text-[8px] md:text-sm font-black text-[var(--foreground)] uppercase">{p.title}</h4>
                        </div>
                     </Card>
                  ))}
               </div>
            </div>
            <div className="bg-[var(--c-bg-alt)]/60 border border-[var(--foreground)]/5 rounded-2xl md:rounded-[var(--c-radius-card)] p-4 md:p-12 space-y-4 md:space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Mic className="w-20 h-20 md:w-40 md:h-40" />
               </div>
               <div className="space-y-2 md:space-y-4 relative z-10">
                  <div className="flex items-center gap-3 md:gap-4">
                     <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex items-center justify-center text-amber-500"><Mic className="w-5 h-5 md:w-8 md:h-8" /></div>
                     <div>
                        <h4 className="text-xs md:text-xl font-black text-[var(--foreground)] uppercase italic">Fleet Radio</h4>
                        <p className="text-[8px] md:text-[10px] text-amber-500/60 font-black uppercase tracking-widest">LIVE BROADCAST</p>
                     </div>
                  </div>
                  <p className="text-[10px] md:text-base text-[var(--c-text-secondary)] font-medium italic leading-relaxed">"The Red Snapper harvest from sector 7 is exceptional today. I recommend a light volcanic salt sear to preserve the fat-integrity. Secure your cuts before registry closure."</p>
                  <div className="pt-2 md:pt-4 flex items-center gap-3">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--foreground)]/10 border border-[var(--foreground)]/10" />
                     <div>
                        <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-tighter">Admiral Chef Vikram</p>
                        <p className="text-[6px] md:text-[8px] text-[var(--c-text-secondary)] uppercase">Senior Fleet Intelligence</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4.2 VERIFIED COMMUNITY DISPATCH (SOCIAL PROOF) */}
      <section className="py-4 md:py-16 bg-[var(--foreground)]/5 border-y border-[var(--foreground)]/5">
         <div className="container mx-auto px-2 md:px-10">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 md:mb-12">
               <div className="space-y-1">
                  <h3 className="text-xl md:text-5xl font-black text-[var(--foreground)] uppercase italic leading-[0.9]">Community Dispatch</h3>
                  <p className="text-[7px] md:text-[10px] font-black text-[var(--c-primary)] uppercase tracking-[0.4em]">Real-time Network Feed</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="text-left md:text-right">
                     <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-tighter">4.9/5 RATING</p>
                     <p className="text-[6px] md:text-[8px] text-[var(--c-text-secondary)] uppercase">8.2k Handshakes</p>
                  </div>
                  <div className="flex -space-x-3 md:-space-x-4">
                     {[1,2,3].map(i => <div key={i} className="w-8 h-8 md:w-14 md:h-14 rounded-full border-2 border-[var(--c-bg)] bg-[var(--foreground)]/10" />)}
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
               {[
                  { user: "Merchant Raj", text: "Registry integrity is top-tier. The Kingfish arrived at protocol.", node: "PORT BLAIR" },
                  { user: "Chef Ananya", text: "Absolute saku grade. Fleet sync is perfect.", node: "HAVELOCK" },
                  { user: "Fleet Scout Sam", text: "Secured the Mud Crabs in 35m.", node: "NEIL NODE" }
               ].map((review, i) => (
                  <div key={i} className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 space-y-3 hover:border-[var(--c-primary)]/40 transition-all group">
                     <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                           {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-warning fill-warning" />)}
                        </div>
                        <Badge variant="glass" className="text-[6px] md:text-[8px] font-black uppercase border-[var(--foreground)]/10">{review.node}</Badge>
                     </div>
                     <p className="text-[10px] md:text-sm text-[var(--c-text-secondary)] font-medium italic">"{review.text}"</p>
                     <div className="flex items-center gap-2 pt-1">
                        <div className="w-6 h-6 rounded-full bg-[var(--c-primary)]/20" />
                        <p className="text-[8px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-tighter">{review.user}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. TRUST & NEWSLETTER */}
      <section className="py-2 md:py-10 container mx-auto px-2 md:px-10 space-y-2 md:space-y-6">
         <div className="grid grid-cols-4 gap-2 md:gap-12 border-b border-[var(--foreground)]/5 pb-2 md:pb-12">
            {[ 
              { 
                icon: <ShieldCheck />, 
                title: "Authorized", 
                color: "text-primary", 
                bg: "bg-primary/10",
                animation: { animate: { scale: [1, 1.1, 1] }, transition: { duration: 2, repeat: Infinity } }
              }, 
              { 
                icon: <Zap />, 
                title: "Instant", 
                color: "text-warning", 
                bg: "bg-warning/10",
                animation: { animate: { y: [0, -4, 0], opacity: [1, 0.7, 1] }, transition: { duration: 1.5, repeat: Infinity } }
              }, 
              { 
                icon: <Clock />, 
                title: "Cold-Chain", 
                color: "text-cyan-400", 
                bg: "bg-cyan-400/10",
                animation: { animate: { rotate: 360 }, transition: { duration: 10, repeat: Infinity, ease: "linear" } }
              }, 
              { 
                icon: <MapPin />, 
                title: "Local", 
                color: "text-success", 
                bg: "bg-success/10",
                animation: { animate: { y: [0, -5, 0] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
              } 
            ].map((item, i) => (
               <div key={i} className="text-center space-y-1 md:space-y-4 group">
                  <motion.div 
                    {...item.animation}
                    className={cn("w-10 h-10 md:w-20 md:h-20 mx-auto rounded-lg md:rounded-[calc(var(--c-radius-card)*0.5)] flex items-center justify-center transition-all [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-10 md:[&>svg]:h-10", item.bg, item.color)}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { className: "w-full h-full" })}
                  </motion.div>
                  <h4 className="text-[6px] md:text-sm font-black text-[var(--c-text-primary)] uppercase italic truncate">{item.title}</h4>
               </div>
            ))}
         </div>
         <Card className="p-4 md:p-12 bg-[var(--c-bg-alt)]/40 border-[var(--foreground)]/5 rounded-[var(--c-radius-card)] text-center space-y-4 md:space-y-10 relative overflow-hidden shadow-premium">
            <div className="space-y-1 md:space-y-4">
               <p className="text-[7px] md:text-[10px] font-black text-[var(--c-primary)] uppercase tracking-[0.4em]">Subscribe for Global Updates</p>
               <h2 className="text-2xl md:text-7xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.9]">Join the Fleet.</h2>
            </div>
            <div className="max-w-2xl mx-auto relative z-10 flex flex-col md:flex-row gap-2 md:gap-4">
               <Input 
                 value={subscriberEmail}
                 onChange={(e) => setSubscriberEmail(e.target.value)}
                 placeholder="Enter your email..." 
                 className="h-10 md:h-20 rounded-full bg-[var(--c-bg)]/50 border-[var(--foreground)]/10 text-center md:text-left text-xs md:text-lg italic px-6 md:px-10 text-[var(--c-text-primary)]" 
               />
               <Button 
                 onClick={handleSubscribe}
                 disabled={isSubscribing}
                 className="h-10 md:h-20 px-10 md:px-12 rounded-full bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)] text-[8px] md:text-[12px] font-black uppercase tracking-[0.3em]"
               >
                 {isSubscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : "COMMISSION"}
               </Button>
            </div>
         </Card>
      </section>


    </>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={
      <div className="bg-[var(--c-bg)] min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--c-primary)] animate-spin" />
      </div>
    }>
      <ProductListingContent />
    </Suspense>
  );
}
