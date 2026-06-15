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
  Loader2,
  Snowflake,
  Anchor,
  Compass,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";
import { MASTER_PRODUCT_REGISTRY } from "@/constants/products";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { authService } from "@/services/authService";
import dynamic from 'next/dynamic';

const OceanReelsFeed = dynamic(
  () => import('@/components/video/OceanReelsFeed').then((mod) => mod.OceanReelsFeed),
  { ssr: false, loading: () => <div className="w-full h-[250px] bg-[var(--c-bg)] animate-pulse my-4 border-y border-[var(--foreground)]/5" /> }
);

// --- BUSINESS INTELLIGENCE DATA ---
const TICKER_ITEMS = [
  "⚡ FLASH DEAL: Tiger Prawns from Havelock just arrived",
  "🚢 NEW ARRIVAL: Fresh catch from 'Andaman Queen' docking in 20m",
  "🔥 TRENDING: Red Snapper demand is high today",
  "🛡️ QUALITY: Freshness guaranteed for all seafood",
  "⚓ STORE UPDATE: Port Blair hub is fully stocked"
];

const AUTHORITY_BADGES = [
  { label: "FSSAI AUTH", icon: <ShieldCheck /> },
  { label: "ISO 22000", icon: <CheckCircle2 /> },
  { label: "COLD-CHAIN", icon: <Zap /> },
  { label: "SUSTAINABLE", icon: <Leaf /> }
];

const CULINARY_PROTOCOLS = [
  { title: "Snapper Recipe", subtitle: "Chef's Recommendation", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80" },
  { title: "Crab Storage", subtitle: "Best Practices", image: "https://images.unsplash.com/photo-1559739511-e9987a55b4bf?auto=format&fit=crop&q=80" }
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
    addItem({
      id: hydratedProduct.id,
      name: hydratedProduct.name,
      price: hydratedProduct.price,
      image: hydratedProduct.images[0] || hydratedProduct.image,
      quantity: 1,
      sellerId: hydratedProduct.seller_id || "SEL-000"
    });
    toast(`${hydratedProduct.name} added to cart.`, "success");
    setQuantity(1);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
      <Card 
        onClick={() => router.push(`/customer/products/${hydratedProduct.id}`)}
        className="relative overflow-hidden bg-[var(--c-card)] border-[var(--foreground)]/5 rounded-[calc(var(--c-radius-card)*0.5)] group-hover:border-[var(--c-primary)]/30 transition-all duration-500 shadow-xl group-hover:shadow-[var(--c-shadow-glow)] cursor-pointer"
      >
        <div className="relative aspect-[4/5] bg-black overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl group-hover:scale-105 transition-transform duration-700 select-none">
              {(() => {
                const imgStr = hydratedProduct.images?.[0] || hydratedProduct.image;
                if (typeof imgStr === 'string' && (imgStr.startsWith('http') || imgStr.startsWith('/'))) {
                  return <img src={imgStr} className="w-full h-full object-contain" />;
                }
                return <span>{imgStr}</span>;
              })()}
            </div>
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-bg-alt)] via-transparent to-transparent opacity-60" />
           <div className="absolute top-2 left-2 flex flex-col gap-1">
              {(hydratedProduct.status === 'COMING_SOON' || hydratedProduct.status === 'COMING SOON') ? (
                <Badge className="shadow-[var(--c-shadow-glow)] text-[7px] font-black uppercase italic rounded-full border-none px-2 py-1 text-black bg-amber-500 animate-pulse">
                  COMING SOON
                </Badge>
              ) : (
                <Badge className={cn(
                  "shadow-[var(--c-shadow-glow)] text-[7px] font-black uppercase italic rounded-full border-none px-2 py-1 text-[var(--foreground)]",
                  hydratedProduct.is_live_inventory == 1 ? "bg-emerald-500 animate-pulse" : "bg-[var(--c-primary)]"
                )}>
                  {hydratedProduct.is_live_inventory == 1 ? "LIVE BATCH" : (hydratedProduct.badge || "PREMIUM")}
                </Badge>
              )}
              {hydratedProduct.discount && <Badge className="bg-success text-[7px] font-black uppercase italic rounded-full border-none px-2 py-1 text-white">{hydratedProduct.discount}</Badge>}
           </div>
           <button onClick={(e) => { e.stopPropagation(); toast("Added to Wishlist.", "success"); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[var(--c-text-primary)] hover:bg-danger hover:text-white transition-all flex items-center justify-center"><Heart className="w-4 h-4" /></button>
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
              {(hydratedProduct.status === 'COMING_SOON' || hydratedProduct.status === 'COMING SOON') ? (
                <Button disabled className="h-8 md:h-12 px-2 md:px-4 rounded-lg md:rounded-[var(--c-radius-btn)] bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[8px] md:text-xs font-black uppercase tracking-tighter">
                  COMING SOON
                </Button>
              ) : quantity === 0 ? (
                <Button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }} className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-[var(--c-radius-btn)] bg-[var(--c-primary)] hover:bg-[var(--c-primary-light)] shadow-[var(--c-shadow-glow)] flex items-center justify-center p-0 transition-all active:scale-90 text-[var(--foreground)]"><Plus className="w-4 h-4 md:w-6 md:h-6" /></Button>
              ) : (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="flex items-center bg-[var(--foreground)]/5 rounded-lg md:rounded-[var(--c-radius-btn)] border border-[var(--foreground)]/10 overflow-hidden h-8 md:h-12">
                   <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(q => Math.max(0, q - 1)); }} className="w-6 md:w-10 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--c-text-primary)]"><Minus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                   <span className="w-6 md:w-8 text-center text-[10px] md:text-xs font-black text-[var(--c-primary)]">{quantity}</span>
                   <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(q => q + 1); }} className="w-6 md:w-10 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--c-text-primary)]"><Plus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                </div>
              )}
           </div>
        </div>
      </Card>
    </motion.div>
  );
};

const AddonCard = ({ addon }: { addon: any }) => {
  const { addItem } = useCartStore();
  const { toast } = useToast();
  
  const handleAdd = () => {
     addItem({
        id: addon.id,
        name: addon.name,
        price: addon.price,
        image: addon.image_url || "https://images.unsplash.com/photo-1596683788737-88981f33f674?q=80&w=500",
        quantity: 1,
        sellerId: "SEL-ADDON"
     });
     toast(`${addon.name} added to cart.`, "success");
  };

  return (
    <div className="w-[200px] flex-shrink-0 bg-[var(--c-card)] border border-[var(--foreground)]/10 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
       <div className="flex items-center gap-3">
          <img src={addon.image_url || "https://images.unsplash.com/photo-1596683788737-88981f33f674?q=80&w=500"} className="w-12 h-12 rounded-lg object-cover bg-black/10" />
          <div className="flex-1">
             <h4 className="text-[10px] font-black uppercase text-[var(--c-text-primary)] leading-tight">{addon.name}</h4>
             <p className="text-[8px] text-[var(--c-text-secondary)] italic">{addon.type || "Add-on"}</p>
          </div>
       </div>
       <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--foreground)]/5">
          <span className="text-[12px] font-black text-emerald-400">₹{addon.price}</span>
          <Button onClick={handleAdd} className="h-6 px-3 rounded-md bg-[var(--c-primary)] text-[var(--foreground)] text-[8px] font-black uppercase shadow-[var(--c-shadow-glow)]">+ ADD</Button>
       </div>
    </div>
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

const CATEGORIES = ["All Seafood", ...PRODUCT_CATEGORIES.map(c => c.label)];
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
  const itemsPerPage = 8;

  // --- LIVE REGISTRY SYNC ENGINE ---
  const [products, setProducts] = React.useState<any[]>([]);
  const [addons, setAddons] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [subscriberEmail, setSubscriberEmail] = React.useState("");
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const [activeCoupons, setActiveCoupons] = React.useState<any[]>([]);

  // Hero Carousel Logic
  const [currentHeroSlide, setCurrentHeroSlide] = React.useState(0);
  const heroSlides = React.useMemo(() => {
    const slides = [settings.customerAssets?.hero, settings.customerAssets?.hero2, settings.customerAssets?.hero3].filter(Boolean);
    return slides.length > 0 ? slides : null;
  }, [settings.customerAssets]);

  React.useEffect(() => {
    if (!heroSlides || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const handleSubscribe = async () => {
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      toast("Invalid Email Address", "error");
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
        toast("Subscription Successful. Welcome to Ocean Exotic!", "success");
        setSubscriberEmail("");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast("Subscription Failed", "error");
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
      let area = "";
      const user = authService.getCurrentUser();
      if (user) {
        try {
          const addrRes = await fetch(`/api/user/addresses?userId=${user.id}`);
          if (addrRes.ok) {
            const addrData = await addrRes.json();
            const addresses = Array.isArray(addrData) ? addrData : (addrData.data || []);
            const defaultAddr = addresses.find((a: any) => a.is_default || a.primary) || addresses[0];
            if (defaultAddr && defaultAddr.jetty) {
              area = defaultAddr.jetty;
            }
          }
        } catch (addrErr) {
          console.error("Error fetching user address in products page:", addrErr);
        }
      }

      const url = area ? `/api/seller/products?area=${encodeURIComponent(area)}` : '/api/seller/products';
      const res = await fetch(url);
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

      // Fetch Addons
      try {
        const addonUrl = area ? `/api/addons/list?area=${encodeURIComponent(area)}` : '/api/addons/list';
        const addonRes = await fetch(addonUrl);
        if (addonRes.ok) {
           const addonData = await addonRes.json();
           setAddons(Array.isArray(addonData) ? addonData : []);
        }
      } catch (addonErr) {
        console.error("Addons sync failed", addonErr);
      }

      // Fetch active coupons for Hero Banner
      try {
        const cRes = await fetch('/api/system/coupons');
        if (cRes.ok) {
           const cData = await cRes.json();
           if (cData.status === 'success' && cData.content) {
             const valid = cData.content.filter((c: any) => {
               if (c.status !== 'ACTIVE') return false;
               if (c.usage_limit && c.usage_count >= c.usage_limit) return false;
               if (c.expiry_date && new Date(c.expiry_date) < new Date()) return false;
               return true;
             });
             setActiveCoupons(valid);
           }
        }
      } catch (err) {
        console.error("Coupons sync failed", err);
      }

    } catch (err) {
      toast("Failed to load catalog. Using cached fallback.", "error");
      setProducts(MASTER_PRODUCT_REGISTRY);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLiveRegistry();
  }, []);

  // --- LAYERED VIEW DATA ---
  const bestsellers = React.useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  const readyToCook = React.useMemo(() => {
    return products.filter(p => 
      p.category?.toLowerCase() === 'ready to cook' || 
      /marinate|grill|fry|masala|ready|spice/i.test((p.name || '') + ' ' + (p.tagline || ''))
    );
  }, [products]);

  const showLayers = activeTab === "All Seafood" && searchQuery === "";

  // --- FILTERING & PAGINATION LOGIC ---
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      // Find the label for the product's database category
      const dbCat = PRODUCT_CATEGORIES.find(c => c.id === p.category);
      const productCategoryLabel = dbCat ? dbCat.label : null;

      const matchesTab = activeTab === "All Seafood" || productCategoryLabel === activeTab || p.category === activeTab;
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

  const dynamicTickerItems = React.useMemo(() => {
    const couponTickerItems = activeCoupons.map((coupon: any) => 
      `🔥 USE CODE ${coupon.code} FOR ${coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`} OFF!${coupon.min_purchase > 0 ? ` (Min ₹${coupon.min_purchase})` : ''}`
    );
    const combined = [...couponTickerItems, ...TICKER_ITEMS];
    return [...combined, ...combined];
  }, [activeCoupons]);

  if (!mounted || isLoading) {
    return (
      <div className="bg-[var(--c-bg)] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 text-[var(--c-primary)] animate-spin" />
           <p className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-40">Loading Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1.1 LIVE HARVEST TICKER (SCARCITY & URGENCY) */}
      <div className="sticky top-16 md:top-20 left-0 right-0 z-[90] bg-[var(--c-primary)] h-8 md:h-10 flex items-center overflow-hidden border-y border-[var(--foreground)]/10">
         <div className="flex animate-marquee whitespace-nowrap gap-10 md:gap-20">
            {dynamicTickerItems.map((item, i) => (
               <span key={i} className="text-[7px] md:text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white animate-pulse" /> {item}
               </span>
            ))}
         </div>
      </div>

      {/* 2. PROMOTIONAL HERO BANNER */}
      {activeCoupons.length > 0 && (
         <section className="pt-6 md:pt-10 pb-6 md:pb-10">
            <div className="container mx-auto px-2 md:px-10">
               <div className="relative w-full overflow-hidden rounded-2xl md:rounded-[calc(var(--c-radius-card)*1.2)] bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/20 p-4 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-glow-primary group">
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-all duration-700" />
                  
                  <div className="relative z-10 space-y-1.5 md:space-y-2 text-center md:text-left w-full md:w-auto">
                     <Badge className="bg-primary text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest italic border-none">Exclusive Offer</Badge>
                     <h2 className="text-xl sm:text-2xl md:text-4xl font-black uppercase italic text-[var(--c-text-primary)] leading-tight">
                        Save <span className="text-primary">{activeCoupons[0].type === 'PERCENTAGE' ? `${activeCoupons[0].value}%` : `₹${activeCoupons[0].value}`}</span> Today
                     </h2>
                     <p className="text-[9px] md:text-sm font-medium text-[var(--c-text-secondary)] max-w-md mx-auto md:mx-0">
                        Apply this code at checkout to instantly upgrade your seafood experience.
                        {activeCoupons[0].min_purchase > 0 && ` Minimum order: ₹${activeCoupons[0].min_purchase}.`}
                     </p>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2 bg-[var(--c-bg)] p-3 md:p-6 rounded-xl md:rounded-3xl border border-[var(--foreground)]/10 shadow-xl w-full md:w-auto shrink-0">
                     <span className="text-[8px] font-black uppercase tracking-widest text-[var(--c-text-secondary)] italic">Your Promo Code</span>
                     <div className="px-4 py-2 md:px-6 md:py-3 bg-primary/10 border-2 border-primary/30 rounded-lg md:rounded-xl w-full flex justify-center">
                        <span className="text-base sm:text-lg md:text-2xl font-black text-primary tracking-[0.2em]">{activeCoupons[0].code}</span>
                     </div>
                  </div>
               </div>
            </div>
         </section>
      )}

      {/* 3. SEARCH & FILTER HERO - RECTIFIED WATERLINE */}
      <section className={cn(
         "pb-2 md:pb-8",
         activeCoupons.length > 0 ? "pt-[16px] md:pt-[24px]" : "pt-[48px] md:pt-[56px]"
      )}>
         <div className="container mx-auto px-2 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-8 items-center">
               <div className="space-y-1 md:space-y-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5 md:space-y-2">
                     <Badge className="bg-[var(--c-primary)]/20 text-[var(--c-primary)] border-[var(--c-primary)]/20 text-[6px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 uppercase italic tracking-widest">Premium Seafood Discovery</Badge>
                     <h2 className="text-xl md:text-5xl lg:text-6xl font-black uppercase italic leading-[0.9] tracking-tighter text-[var(--c-text-primary)]">The World's <span className="text-[var(--c-primary)]">Freshest</span> <br /> Seafood Market</h2>
                  </motion.div>
                  <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                     <div className="flex-1 relative group">
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search the database..." className="h-9 md:h-14 bg-[var(--foreground)]/5 border-[var(--foreground)]/10 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-12 md:pr-16 text-[9px] md:text-sm italic focus:border-[var(--c-primary)] text-[var(--c-text-primary)] transition-all group-hover:bg-[var(--foreground)]/10" />
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--c-text-secondary)] group-focus-within:text-[var(--c-primary)] transition-colors" />
                     </div>
                  </div>
               </div>
               <div className="hidden lg:block relative w-full h-full">
                  <div className="relative w-full h-full min-h-[300px] bg-gradient-to-br from-[var(--c-primary)]/20 to-blue-500/20 rounded-[var(--c-radius-card)] overflow-hidden shadow-[var(--c-shadow-glow)] group">
                     {heroSlides ? (
                       <>
                         <AnimatePresence initial={false}>
                           <motion.img 
                             key={currentHeroSlide}
                             initial={{ opacity: 0, x: 50 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -50 }}
                             transition={{ duration: 0.6, ease: "easeInOut" }}
                             src={heroSlides[currentHeroSlide]} 
                             alt={`Featured Slide ${currentHeroSlide + 1}`} 
                             className="absolute inset-0 w-full h-full object-cover" 
                           />
                         </AnimatePresence>
                         {heroSlides.length > 1 && (
                           <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2 md:gap-3 z-20">
                             {heroSlides.map((_, i) => (
                               <button 
                                 key={i}
                                 onClick={() => setCurrentHeroSlide(i)}
                                 className={cn(
                                   "w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 shadow-sm",
                                   currentHeroSlide === i ? "bg-[var(--c-primary)] scale-125" : "bg-white/60 hover:bg-white"
                                 )}
                               />
                             ))}
                           </div>
                         )}
                       </>
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10rem] xl:text-[14rem]">
                          🦀
                        </div>
                     )}
                     <div className="absolute -inset-20 bg-[var(--c-primary)]/5 blur-[120px] rounded-full animate-pulse pointer-events-none" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3.1 AUTHORITY VERIFICATION (DEEP TRUST) */}
      <section className="py-1 md:py-6 border-y border-[var(--foreground)]/5 bg-[var(--foreground)]/5 backdrop-blur-md">
         <div className="container mx-auto px-2 md:px-10">
            <div className="flex items-center justify-between gap-4 md:gap-10 overflow-hidden">
               <div className="flex flex-col flex-shrink-0">
                  <span className="text-[6px] md:text-[10px] font-black text-[var(--c-primary)] uppercase tracking-widest">Quality</span>
                  <h3 className="text-[10px] md:text-xl font-black text-[var(--c-text-primary)] uppercase italic">Certifications.</h3>
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

      {/* 3.2 OCEAN REELS VIDEO SHOWCASE */}
      <OceanReelsFeed />

      {/* 4. MAIN EXPLORER REGISTRY */}
      <section className="pb-8 md:pb-16">
         <div className="container mx-auto px-2 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-8">
               
               {/* STICKY LEFT SIDEBAR */}
               <aside className="hidden lg:block lg:col-span-2 space-y-4 sticky top-24 h-fit">
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
                     <Button className="w-full h-10 rounded-lg bg-[var(--c-primary)] text-[var(--foreground)] font-black uppercase text-[10px] md:text-xs shadow-[var(--c-shadow-glow)]">Apply Filters</Button>
                  </div>
               </aside>

               {/* MAIN GRID HUB */}
               <main className="lg:col-span-10 space-y-2 md:space-y-4">
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

                  {showLayers && (
                    <div className="space-y-8 pb-8 border-b border-[var(--foreground)]/10 mb-8">
                       {/* LAYER 1: BESTSELLERS */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <h3 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] uppercase italic">Today's <span className="text-[var(--c-primary)]">Catch</span></h3>
                             <button onClick={() => setActiveTab("Fresh Fish")} className="text-[10px] font-black uppercase text-[var(--c-primary)] flex items-center gap-1 group">View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></button>
                          </div>
                          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                             {bestsellers.map(product => (
                               <div key={product.id} className="w-[280px] lg:w-[calc(25%-12px)] flex-shrink-0 snap-start">
                                 <ProductCard product={product} />
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* LAYER 2: READY TO COOK */}
                       {readyToCook.length > 0 && (
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="text-xl md:text-3xl font-black text-[var(--c-text-primary)] uppercase italic">Chef's <span className="text-amber-500">Specials</span></h3>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                               {readyToCook.map(product => (
                                 <div key={product.id} className="w-[280px] lg:w-[calc(25%-12px)] flex-shrink-0 snap-start">
                                   <ProductCard product={product} />
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {/* LAYER 3: CULINARY ADDONS */}
                       {addons.length > 0 && (
                         <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="text-xl md:text-2xl font-black text-[var(--c-text-primary)] uppercase italic">Extras & <span className="text-emerald-500">Add-ons</span></h3>
                             </div>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 snap-x">
                               {addons.map(addon => (
                                 <div key={addon.id} className="snap-start">
                                   <AddonCard addon={addon} />
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       <div className="pt-4 flex items-center gap-4">
                           <div className="h-px bg-[var(--foreground)]/10 flex-1" />
                           <h3 className="text-sm font-black text-[var(--c-text-secondary)] uppercase tracking-[0.2em] italic">Categories</h3>
                           <div className="h-px bg-[var(--foreground)]/10 flex-1" />
                        </div>

                        {/* CATEGORY-WISE SECTIONS */}
                        <div className="space-y-12">
                          {PRODUCT_CATEGORIES.map((category) => {
                            const categoryProducts = products.filter(p => {
                              const dbCat = PRODUCT_CATEGORIES.find(c => c.id === p.category);
                              return (dbCat ? dbCat.label : null) === category.label || p.category === category.label || p.category === category.id;
                            });
                            
                            if (categoryProducts.length === 0) return null;
                            
                            return (
                              <div key={category.id} className="space-y-4">
                                 <div className="flex items-center justify-between">
                                    <h3 className="text-xl md:text-2xl font-black text-[var(--c-text-primary)] uppercase italic">{category.label}</h3>
                                    <button onClick={() => setActiveTab(category.label)} className="text-[10px] font-black uppercase text-[var(--c-primary)] flex items-center gap-1 group">View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></button>
                                 </div>
                                 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                                    {categoryProducts.map(product => (
                                      <div key={product.id} className="w-[280px] lg:w-[calc(25%-12px)] flex-shrink-0 snap-start">
                                        <ProductCard product={product} />
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            );
                          })}
                        </div>
                     </div>
                  )}

                  {!showLayers && (
                    <>
                      {paginatedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[4px] md:gap-4">
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
                    </>
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
                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20 text-[8px] md:text-[10px] font-black uppercase">Chef's Recommendations</Badge>
                  <h2 className="text-2xl md:text-6xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.9]">Master the <br /> Seafood Recipes.</h2>
                  <p className="text-[10px] md:text-lg text-[var(--c-text-secondary)] font-medium italic max-w-md">Real-time culinary advice for every seafood meal.</p>
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
                        <h4 className="text-xs md:text-xl font-black text-[var(--foreground)] uppercase italic">Chef's Tips</h4>
                        <p className="text-[8px] md:text-[10px] text-amber-500/60 font-black uppercase tracking-widest">LIVE UPDATES</p>
                     </div>
                  </div>
                  <p className="text-[10px] md:text-base text-[var(--c-text-secondary)] font-medium italic leading-relaxed">"The Red Snapper catch is exceptional today. I recommend a light pan sear to preserve the flavor. Secure yours before we sell out."</p>
                  <div className="pt-2 md:pt-4 flex items-center gap-3">
                     <img src="https://i.pravatar.cc/150?img=11" alt="Chef Vikram" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-[var(--foreground)]/10 object-cover" />
                     <div>
                        <p className="text-[10px] md:text-[12px] font-black text-[var(--foreground)] uppercase tracking-tighter">Chef Vikram</p>
                        <p className="text-[8px] md:text-[10px] text-[var(--c-text-secondary)] uppercase">Senior Culinary Expert</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. TRUST */}
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
                    {...(item.animation as any)}
                    className={cn("w-10 h-10 md:w-20 md:h-20 mx-auto rounded-lg md:rounded-[calc(var(--c-radius-card)*0.5)] flex items-center justify-center transition-all [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-10 md:[&>svg]:h-10", item.bg, item.color)}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { className: "w-full h-full" })}
                  </motion.div>
                  <h4 className="text-[6px] md:text-sm font-black text-[var(--c-text-primary)] uppercase italic truncate">{item.title}</h4>
               </div>
            ))}
         </div>
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
