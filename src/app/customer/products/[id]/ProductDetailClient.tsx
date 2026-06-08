"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  Anchor,
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  UtensilsCrossed,
  MessageCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Timer,
  ThermometerSnowflake,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Calendar,
  Verified,
  Flag,
  ArrowRight
} from "lucide-react";

import Link from "next/link";
import CutOptionsSelector from "@/components/marketplace/CutOptionsSelector";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { MASTER_PRODUCT_REGISTRY, MASTER_ADDONS_REGISTRY } from "@/constants/products";
import { reviewService } from "@/services/reviewService";
import { Schema, generateProductSchema } from "@/components/seo/Schema";
import { authService } from "@/services/authService";
// Generic fallback for unknown IDs not yet in the registry
const UNKNOWN_PRODUCT_FALLBACK = (id: string) => ({
  id, name: `Seafood Product ${id}`, tagline: "Premium Maritime Catch",
  price: 999, originalPrice: 1200, rating: 4.5, reviews: 0,
  sellerName: "OceanExotic Global Seller", sellerId: "SEL-000", delivery: "45-60 min",
  availability: "In Stock", stock: 10, badge: "FRESH CATCH",
  description: "A premium seafood product from the OceanExotic Global Maritime Registry.",
  images: ["https://images.unsplash.com/photo-1534422298391-e4f8c170db06?q=80&w=2000"],
  variants: [
    { id: "v1", label: "1/2 KG HARVEST", price: 999, status: "Available" },
    { id: "v2", label: "1 KG HARVEST", price: 1800, status: "Available" }
  ],
  nutrition: { protein: "20g", omega3: "300mg", calories: "100 kcal", fat: "2g" },
  trustBadges: ["Fresh Catch", "Hygienic"],
  recipes: [{ title: "Simple Steam", time: "15 min", difficulty: "Easy" }],
  customerReviews: [
    { name: "John D.", rating: 5, date: "2 days ago", comment: "Exceptional quality. The freshness was undeniable." },
    { name: "Sarah M.", rating: 4, date: "1 week ago", comment: "Very good, though delivery took slightly longer than expected." }
  ]
});

export default function ProductDetailPage({ 
  initialProduct, 
  initialCutOptions, 
  baseline, 
  productId 
}: { 
  initialProduct: any, 
  initialCutOptions: any[], 
  baseline: any,
  productId: string
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, addItem, removeItem } = useCartStore();
  const { currencySymbol } = useSettingsStore();

  const [product, setProduct] = useState<any>(initialProduct || baseline);
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState<any>(product?.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCuts, setSelectedCuts] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);

  const [baseSelectedPrice, setBaseSelectedPrice] = useState(product?.price || 0);
  const [selectedPrepOption, setSelectedPrepOption] = useState<any>(
    product?.prep_options?.find((o: any) => o.prep_type === 'RAW') || 
    product?.prep_options?.[0] || 
    null
  );

  // Client-side fetch logic for location overrides and prep options
  useEffect(() => {
    const fetchLiveDetails = async () => {
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
          console.error("Error fetching user address in details page:", addrErr);
        }
      }
      
      try {
        const url = area ? `/api/products/detail?id=${encodeURIComponent(productId)}&area=${encodeURIComponent(area)}` : `/api/products/detail?id=${encodeURIComponent(productId)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setProduct(data);
            setBaseSelectedPrice(data.price);
            if (data.prep_options && data.prep_options.length > 0) {
              const rawOpt = data.prep_options.find((o: any) => o.prep_type === 'RAW');
              setSelectedPrepOption(rawOpt || data.prep_options[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching live product detail:", err);
      }
    };
    
    fetchLiveDetails();
  }, [productId]);

  // Dynamically update currentPrice based on selection & prep options additions
  useEffect(() => {
    const addPrice = selectedPrepOption ? parseFloat(selectedPrepOption.price_flat_add) : 0;
    setCurrentPrice(baseSelectedPrice + addPrice);
  }, [baseSelectedPrice, selectedPrepOption]);

  // Amazon Scroll Zoom States & Refs
  const [zoomScale, setZoomScale] = useState(2.0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Amazon Lens Zoom States
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const { scrollY } = useScroll();
  const subHeaderOpacity = useTransform(scrollY, [100, 200], [0, 1]);

  useEffect(() => {
    if (productId) {
      reviewService.getProductReviews(productId).then(setReviews).catch(console.error);
    }
  }, [productId]);

  // Native wheel event listener to support zoom in/out on hover without page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoomScale((prev) => {
        const next = prev + delta;
        return Math.max(1.2, Math.min(5.0, next));
      });
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: selectedPrepOption ? `${product.name} (${selectedPrepOption.name})` : product.name,
      price: currentPrice,
      image: product.images?.[0] || product.image,
      quantity,
      sellerId: product.seller_id || product.sellerId || "SEL-000",
      metadata: {
        ...selectedCuts,
        prep_option: selectedPrepOption ? {
          id: selectedPrepOption.id,
          prep_type: selectedPrepOption.prep_type,
          name: selectedPrepOption.name,
          price_flat_add: selectedPrepOption.price_flat_add
        } : null
      }
    });
    toast(`${product.name} commissioned to cart.`, "success");
  };

  const handleAddAddonToCart = (addon: any) => {
    addItem({
      id: addon.id,
      name: addon.name,
      price: parseFloat(addon.price),
      image: addon.image_url || "/ICONS/masala.png",
      quantity: 1,
      sellerId: product.seller_id || product.sellerId || "SEL-000",
      metadata: { is_addon: true }
    });
    toast(`${addon.name} added to cart.`, "success");
  };

  const isAddonInCart = (addonId: string) => {
    return items.some((item: any) => item.id === addonId);
  };

  const handleToggleAddon = (addon: any) => {
    if (isAddonInCart(addon.id)) {
      removeItem(addon.id);
      toast(`${addon.name} removed from cart.`, "info");
    } else {
      handleAddAddonToCart(addon);
    }
  };

  const getPrepIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'RAW': return '🐟';
      case 'MARINATED': return '🧂';
      case 'GRILLED': return '🔥';
      case 'FRIED': return '🍳';
      default: return '🍽️';
    }
  };

  const isComingSoon = product.badge === 'COMING SOON' || product.badge === 'COMING_SOON' || product.availability === 'Coming Soon' || product.availability === 'COMING SOON';

  if (!product) {
    return (
        <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[var(--c-primary)] animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] italic">Loading product details...</p>
        </div>
    );
  }

  const getProductGallery = (prod: any): string[] => {
    if (!prod) return [];
    const galleryVal = prod.gallery;
    if (!galleryVal) return [];
    if (Array.isArray(galleryVal)) return galleryVal;
    try {
      const parsed = JSON.parse(galleryVal);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const allImages = [
    prodImage(product.image_url || product.image),
    ...(product.images || []),
    ...getProductGallery(product)
  ].filter(Boolean);

  function prodImage(img: any) {
    if (!img) return "";
    return typeof img === 'string' ? img : "";
  }

  if (allImages.length === 0) {
    allImages.push("🐟");
  }

  const productAddons = product.addons?.map((addon: any) => {
    if (typeof addon === 'object' && addon !== null) return addon;
    return MASTER_ADDONS_REGISTRY.find(a => a.id === addon);
  }).filter(Boolean) || [];

  return (
    <>
      {/* Dynamic Structured Data for Search Engines */}
      <Schema type="Product" data={generateProductSchema(product)} />
      
      {/* Sticky Sub-header */}
      <motion.div style={{ opacity: subHeaderOpacity }} className="fixed top-0 left-0 right-0 z-[80] bg-[var(--c-bg)]/80 backdrop-blur-2xl border-b border-[var(--foreground)]/5 h-16 hidden lg:flex items-center">
         <div className="container mx-auto px-10 flex items-center justify-between">
            <div className="flex items-center gap-[4px]">
               <div className="w-10 h-10 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center text-xl">{product.image}</div>
               <div>
                  <h3 className="text-sm font-black text-[var(--c-text-primary)] uppercase italic">{product.name}</h3>
                  <p className="text-[9px] font-bold text-[var(--c-primary)] uppercase tracking-widest">
                    {selectedPrepOption ? selectedPrepOption.name : (activeVariant?.label || "Standard")}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-[10px]">
               <p className="text-xl font-black text-[var(--c-text-primary)] italic">₹{currentPrice.toLocaleString()}</p>
               <Button 
                 disabled={isComingSoon} 
                 onClick={handleAddToCart} 
                 className={cn(
                   "h-10 px-8 rounded-full text-[10px] font-black uppercase",
                   isComingSoon 
                     ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" 
                     : "bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)]"
                 )}
               >
                 {isComingSoon ? "COMING SOON" : "ADD TO CART"}
               </Button>
            </div>
         </div>
      </motion.div>

      <div className="container mx-auto px-4 md:px-10 pt-4 md:pt-16 pb-10">
        {/* --- LAYER 1: COMMAND LAYER (HERO) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[4px] md:gap-[10px]">
          
          {/* Visual Registry */}
          <div className="lg:col-span-7 flex flex-row gap-[4px] md:gap-[10px] relative">
            
            {/* THUMBNAIL CONTAINER - ALIGNED LEFT ON ALL DEVICES */}
            <div className="relative flex flex-col h-full w-[32px] sm:w-[42px] md:w-[54px] shrink-0">
               {/* Scroll Up Button */}
               {allImages.length > 4 && (
                 <button 
                   onClick={() => thumbnailsRef.current?.scrollBy({ top: -80, left: -80, behavior: 'smooth' })}
                   className="flex absolute top-0 left-0 right-0 h-5 bg-black/40 hover:bg-black/60 items-center justify-center text-white z-10 rounded-t-lg transition-all"
                 >
                   <ChevronUp className="w-3.5 h-3.5" />
                 </button>
               )}

               <div 
                 ref={thumbnailsRef}
                 className="flex flex-col gap-[4px] lg:gap-[6px] no-scrollbar overflow-y-auto w-full h-[300px] md:h-[400px] lg:h-full py-1 lg:py-6 scroll-smooth items-stretch"
               >
                 {allImages.map((img: string, i: number) => (
                   <button 
                     key={i} 
                     onMouseEnter={() => setActiveImage(i)}
                     onClick={() => setActiveImage(i)} 
                     className={cn(
                       "relative overflow-hidden flex-shrink-0 border-2 transition-all bg-[var(--c-bg-alt)] flex items-center justify-center rounded-[8px] h-auto w-full aspect-square text-base sm:text-xl md:text-3xl",
                       activeImage === i ? "border-[var(--c-primary)] scale-105 shadow-[var(--c-shadow-glow)]" : "border-[var(--foreground)]/5 opacity-60 hover:opacity-100"
                     )}
                   >
                     {(img?.startsWith('http') || img?.startsWith('/')) ? <img src={img} className="w-full h-full object-contain" alt="thumbnail" /> : img}
                   </button>
                 ))}
               </div>

               {/* Scroll Down Button */}
               {allImages.length > 4 && (
                 <button 
                   onClick={() => thumbnailsRef.current?.scrollBy({ top: 80, left: 80, behavior: 'smooth' })}
                   className="flex absolute bottom-0 left-0 right-0 h-5 bg-black/40 hover:bg-black/60 items-center justify-center text-white z-10 rounded-b-lg transition-all"
                 >
                   <ChevronDown className="w-3.5 h-3.5" />
                 </button>
               )}
            </div>

            {/* MAIN IMAGE CONTAINER */}
            <div 
              ref={containerRef}
              onMouseEnter={() => {
                setIsHovering(true);
                setIsZooming(true);
              }}
              onMouseLeave={() => {
                setIsHovering(false);
                setIsZooming(false);
                setZoomScale(2.0);
              }}
              onMouseMove={(e) => {
                const target = e.currentTarget;
                const { left, top, width, height } = target.getBoundingClientRect();
                const x_m = e.clientX - left;
                const y_m = e.clientY - top;
                const w_l = 150;
                const h_l = 150;
                let x_l = x_m - w_l / 2;
                let y_l = y_m - h_l / 2;
                x_l = Math.max(0, Math.min(width - w_l, x_l));
                y_l = Math.max(0, Math.min(height - h_l, y_l));
                setLensPos({ x: x_l, y: y_l });
                const s = 3;
                const offset_x = -x_l * (width * (s - 1)) / (width - w_l);
                const offset_y = -y_l * (height * (s - 1)) / (height - h_l);
                setZoomOffset({ x: offset_x, y: offset_y });
              }}
              className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-[var(--c-bg-alt)] rounded-[20px] overflow-hidden group border border-[var(--foreground)]/5 flex-1 w-full cursor-crosshair order-1 lg:order-none"
            >
               <AnimatePresence mode="wait">
                 <motion.div 
                    key={activeImage} 
                    initial={{ opacity: 0, scale: 1.1 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.6 }} 
                    className="w-full h-full flex items-center justify-center text-[10rem] md:text-[15rem] overflow-hidden"
                 >
                   {(allImages[activeImage]?.startsWith('http') || allImages[activeImage]?.startsWith('/')) ? (
                     <img 
                        src={allImages[activeImage]} 
                        className="w-full h-full object-contain transition-transform duration-100 ease-out"
                        style={{
                          transform: isHovering ? `scale(${zoomScale})` : 'scale(1)'
                        }}
                        alt={product.name} 
                      />
                   ) : allImages[activeImage]}
                 </motion.div>
               </AnimatePresence>
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-[10px] left-[10px] pointer-events-none z-20">
                   <Badge className="bg-[var(--c-primary)] text-[var(--foreground)] border-none px-4 py-2 rounded-full text-[10px] font-black uppercase italic shadow-[var(--c-shadow-glow)]">{product.badge}</Badge>
                </div>
                
                {/* Rating Portal */}
                <Link 
                  href={`/customer/products/${product.id}/reviews`}
                  className="absolute top-[10px] right-[10px] z-20 group"
                >
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-[var(--foreground)]/20 shadow-2xl group-hover:scale-105 group-hover:border-[var(--c-primary)]/50 transition-all">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black text-[var(--foreground)]">{product.rating}</span>
                      <span className="text-[9px] font-bold text-[var(--foreground)]/60 tracking-tighter">({product.reviews})</span>
                    </div>
                  </div>
                </Link>
 
               <div className="absolute bottom-[4px] md:bottom-[10px] right-[4px] md:right-[10px] flex gap-[2px] md:gap-[4px] z-20">
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--foreground)]/10 backdrop-blur-md border border-[var(--foreground)]/10 flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--c-primary)] transition-all shadow-xl"><Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-danger transition-all shadow-xl"><Heart className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
               </div>

               {/* Amazon Lens Overlay (Yellow tinted square box) */}
               {isZooming && (
                 <div 
                   className="hidden lg:block absolute bg-yellow-500/10 border border-yellow-500/30 rounded-lg pointer-events-none z-30"
                   style={{
                     left: lensPos.x,
                     top: lensPos.y,
                     width: 150,
                     height: 150,
                   }}
                 />
               )}
            </div>

            {/* Amazon Zoom Popover Window (Absolute Right) */}
            <div 
              className="hidden lg:block absolute top-0 -right-[465px] w-[450px] h-[450px] bg-[var(--c-bg-alt)] border border-[var(--foreground)]/10 z-[120] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden pointer-events-none"
              style={{
                opacity: isZooming ? 1 : 0,
                transition: 'opacity 0.15s ease-out',
              }}
            >
              {(allImages[activeImage]?.startsWith('http') || allImages[activeImage]?.startsWith('/')) ? (
                <img 
                   src={allImages[activeImage]} 
                   className="object-contain"
                   style={{
                     width: '300%',
                     height: '300%',
                     maxWidth: 'none',
                     transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px)`,
                     transition: 'transform 0.05s ease-out',
                   }}
                   alt={product.name} 
                 />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[20rem]">
                  {allImages[activeImage]}
                </div>
              )}
            </div>

          </div>

          {/* Identity Hub - PERSISTENT ON DESKTOP */}
          <div className="lg:col-span-5 lg:sticky lg:top-[80px] lg:h-fit space-y-[4px] md:space-y-[10px]">
            <div className="space-y-[2px] md:space-y-[4px]">
              <h1 className="text-xl md:text-5xl font-black text-[var(--c-text-primary)] uppercase italic leading-[0.9] tracking-tighter underline decoration-[var(--c-primary)] decoration-2 md:decoration-4 underline-offset-[6px] md:underline-offset-[12px]">{product.name}</h1>
              <p className="text-[var(--c-text-secondary)] text-[10px] md:text-sm italic font-medium leading-relaxed text-justify mt-1.5 md:mt-3">{product.description}</p>
            </div>

            <div className="space-y-[10px] p-6 bg-[var(--c-bg-alt)]/40 border border-[var(--foreground)]/5 rounded-[24px] w-full mt-2">
               <div className="flex items-center justify-between">
                  <div className="space-y-[2px]">
                     <div className="flex items-center gap-[4px]">
                        <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">Price</p>
                        <span className="text-[8px] font-bold text-[var(--c-primary)] uppercase tracking-widest italic">• {product.weight}</span>
                     </div>
               <div className="flex items-baseline gap-[4px]">
                        <span className="text-3xl font-black text-[var(--c-text-primary)] italic">₹{currentPrice.toLocaleString()}</span>
                        {product.originalPrice > currentPrice && (
                          <span className="text-sm text-[var(--c-text-secondary)] line-through italic font-bold">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                     </div>
                  </div>
                  <div className="inline-flex items-center py-0.5 uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-success/10 text-success border border-success/20 h-6 px-3 rounded-full text-[8px] font-black shadow-glow-purple">
                    {product.availability}
                  </div>
               </div>

               <div className="p-3 bg-gradient-to-r from-[var(--c-primary)]/10 to-transparent border-l-2 border-[var(--c-primary)] rounded-r-xl flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                     <Clock className="w-3.5 h-3.5 text-[var(--c-primary)] animate-pulse" />
                     <div>
                        <p className="text-[8px] font-black uppercase text-[var(--foreground)]">Landed: 4h 12m ago</p>
                        <p className="text-[7px] font-bold uppercase text-[var(--c-text-secondary)]">Premium Quality</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                     <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[8px] font-black text-emerald-500 uppercase">98% FRESH</span>
                  </div>
               </div>

               <div className="space-y-[4px] w-full">
                  {initialCutOptions && initialCutOptions.length > 0 ? (
                    <CutOptionsSelector 
                      cutOptions={initialCutOptions} 
                      basePrice={product.price} 
                      onSelectionChange={(cuts, price) => {
                        setSelectedCuts(cuts);
                        setBaseSelectedPrice(price);
                      }}
                    />
                  ) : (
                    <div className="space-y-[4px]">
                      <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">Select Variant</p>
                      <div className="grid grid-cols-2 gap-[2px]">
                         {product.variants?.map((v: any) => (
                           <button 
                             key={v.id} 
                             onClick={() => {
                               setActiveVariant(v);
                               setBaseSelectedPrice(v.price);
                             }} 
                             className={cn(
                               "relative flex flex-col items-center justify-center py-2 px-1 transition-all group overflow-hidden",
                               activeVariant?.id === v.id ? "bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)]" : "bg-[var(--foreground)]/5 text-[var(--c-text-secondary)] hover:bg-[var(--foreground)]/10"
                             )}
                             style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
                           >
                              <p className={cn("text-[8px] font-black uppercase italic leading-none", activeVariant?.id === v.id ? "text-[var(--foreground)]" : "group-hover:text-[var(--foreground)]")}>{v.label.split(' ')[0]}</p>
                              <span className="text-[9px] font-black italic">₹{v.price.toLocaleString()}</span>
                           </button>
                         ))}
                      </div>
                    </div>
                  )}

                  {/* Preparation & Cooking Customizations */}
                  {product.prep_options && product.prep_options.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--c-primary)]" /> Preparation Style
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {product.prep_options.map((option: any) => (
                          <button
                            key={option.id}
                            onClick={() => setSelectedPrepOption(option)}
                            className={cn(
                              "relative flex flex-col items-center justify-center py-3 px-2 transition-all border rounded-xl overflow-hidden text-center",
                              selectedPrepOption?.id === option.id
                                ? "bg-[var(--c-primary)]/10 border-[var(--c-primary)] text-[var(--foreground)] shadow-[0_0_15px_rgba(var(--c-primary-rgb),0.15)] animate-pulse"
                                : "bg-[var(--foreground)]/5 border-[var(--foreground)]/5 text-[var(--c-text-secondary)] hover:border-[var(--foreground)]/15"
                            )}
                          >
                            <span className="text-lg mb-1">{getPrepIcon(option.prep_type)}</span>
                            <p className="text-[10px] font-black uppercase italic leading-none">{option.name}</p>
                            <span className="text-[9px] font-bold mt-1 opacity-80">
                              {option.price_flat_add > 0 ? `+ ₹${option.price_flat_add}` : "Included"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Licious-Style Smart Add-ons Cross-Sell Engine */}
                  {productAddons.length > 0 && (
                    <div className="p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[20px] mb-4">
                      <div className="flex items-center justify-between mb-2">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <Plus className="w-3 h-3 text-emerald-400" /> Recommended Add-ons
                         </h4>
                         <span className="text-[6px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">RECOMMENDED PAIRING</span>
                      </div>
                      <p className="text-[8px] text-[var(--c-text-secondary)] mb-2">Frequently bought together with this catch for a perfect culinary experience:</p>
                      <div className="space-y-2">
                        {productAddons.map((addon: any) => {
                          const inCart = isAddonInCart(addon.id);
                          return (
                            <div key={addon.id} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--c-bg-alt)] border border-[var(--foreground)]/5 hover:border-emerald-500/30 transition-all">
                              {addon.image_url ? (
                                <img src={addon.image_url} className="w-8 h-8 rounded-lg object-cover bg-black/10 border border-[var(--foreground)]/5" alt={addon.name} />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-sm border border-[var(--foreground)]/5">🧂</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-[var(--foreground)] uppercase truncate leading-none">{addon.name}</p>
                                <p className="text-[7px] text-[var(--c-text-secondary)] truncate mt-0.5 leading-none">{addon.description || "Fresh pairing selection."}</p>
                                <p className="text-[8px] font-black text-[var(--c-primary)] mt-1 leading-none">₹{addon.price}</p>
                              </div>
                              <Button 
                                onClick={() => handleToggleAddon(addon)}
                                className={cn(
                                  "h-6 px-2 text-[7px] font-black uppercase tracking-widest rounded-md transition-all shadow-none flex items-center gap-0.5",
                                  inCart 
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                    : "bg-[var(--foreground)]/10 text-[var(--foreground)] hover:bg-[var(--c-primary)] hover:text-[var(--foreground)]"
                                )}
                              >
                                {inCart ? <><Check className="w-2.5 h-2.5" /> ADDED</> : "+ ADD"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-[4px] md:gap-[10px]">
                    <div className="flex items-center bg-[var(--foreground)]/5 rounded-lg md:rounded-xl border border-[var(--foreground)]/10 overflow-hidden h-10 md:h-12 w-20 md:w-24">
                       <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex-1 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--foreground)]"><Minus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                       <span className="w-6 md:w-8 text-center font-black text-[var(--c-primary)] text-xs md:text-sm">{quantity}</span>
                       <button onClick={() => setQuantity(q => q + 1)} className="flex-1 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--foreground)]"><Plus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                    </div>
                    <button 
                       disabled={isComingSoon} 
                       onClick={handleAddToCart} 
                       className={cn(
                          "whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:opacity-90 px-6 md:px-8 py-2 flex-1 h-10 md:h-12 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-[4px]",
                          isComingSoon 
                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" 
                            : "bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)]"
                       )}
                    >
                       {isComingSoon ? "COMING SOON" : <><ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" /> ADD TO CART</>}
                    </button>
                  </div>       </div>
               
                {/* Yield & Culinary Cut Visualizer */}
                <div className="p-4 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-[20px] space-y-3 mt-4">
                   <h4 className="text-[9px] font-black text-[var(--c-primary)] uppercase tracking-widest flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5" /> Yield Information
                   </h4>
                   <div className="space-y-2">
                      {[
                        { name: "Curry Cut", yield: "75% Yield", desc: "Bone-in, perfect for traditional slow curries." },
                        { name: "Fillet", yield: "55% Yield", desc: "Boneless & skinless, ideal for pan-searing/grilling." },
                        { name: "Whole Cleaned", yield: "85% Yield", desc: "Cleaned gills & entrails, best for baking/tandoor." }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start py-1 border-b border-[var(--foreground)]/5 last:border-b-0">
                          <div>
                            <p className="text-[10px] font-black uppercase text-[var(--foreground)]">{item.name}</p>
                            <p className="text-[8px] text-[var(--c-text-secondary)]">{item.desc}</p>
                          </div>
                          <span className="text-[10px] font-black italic text-[var(--c-primary)]">{item.yield}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

            <div className="grid grid-cols-2 gap-[10px] mt-2">
               <div className="p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-[10px]">
                  <div className="w-8 h-8 rounded-full bg-[var(--c-primary)]/10 flex items-center justify-center text-[var(--c-primary)]"><Truck className="w-4 h-4" /></div>
                  <div>
                     <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase">ETA</p>
                     <p className="text-[10px] font-black text-[var(--foreground)]">{product.delivery}</p>
                  </div>
               </div>
               <div className="p-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center gap-[10px]">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><ThermometerSnowflake className="w-4 h-4" /></div>
                  <div>
                     <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase">Temp</p>
                     <p className="text-[10px] font-black text-[var(--foreground)]">-18°C Stable</p>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* --- LAYER 2: INTELLIGENCE MATRIX (TECHNICAL + AUTHORITY) --- */}
        <div className="mt-[10px] grid grid-cols-1 lg:grid-cols-12 gap-[10px] border-t border-[var(--foreground)]/5 pt-[10px]">
           
           {/* Column 1: Scientific Intelligence (Compact Polygonal Alpha) */}
           <div className="lg:col-span-4 space-y-[8px]">
              <div className="space-y-[4px]">
                 <div className="flex items-center justify-between px-2">
                    <h4 className="text-[11px] font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-[4px]">
                       <Zap className="w-3 h-3 text-[var(--c-primary)] fill-[var(--c-primary)]/20" />
                       Nutrition Facts
                    </h4>
                    <span className="text-[7px] font-black text-[var(--c-primary)] uppercase tracking-widest bg-[var(--c-primary)]/10 px-1.5 py-0.5 rounded-sm border border-[var(--c-primary)]/20">VERIFIED</span>
                 </div>

                 <div className="grid grid-cols-2 gap-[4px]">
                    {[
                      { label: "Protein", value: product?.nutrition?.protein || "20g", icon: <TrendingUp className="w-3 h-3" />, color: "var(--c-primary)", level: "92%" },
                      { label: "Omega-3", value: product?.nutrition?.omega3 || "300mg", icon: <Heart className="w-3 h-3" />, color: "#3b82f6", level: "85%" },
                      { label: "Calories", value: product?.nutrition?.calories || "100 kcal", icon: <Zap className="w-3 h-3" />, color: "#f59e0b", level: "40%" },
                      { label: "Healthy Fat", value: product?.nutrition?.fat || "2g", icon: <ThermometerSnowflake className="w-3 h-3" />, color: "#06b6d4", level: "60%" }
                    ].map((fact, idx) => (
                       <motion.div 
                         key={fact.label}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         className="relative p-2.5 bg-[var(--c-bg-alt)]/60 border border-[var(--foreground)]/5 group hover:border-[var(--foreground)]/20 transition-all cursor-default"
                         style={{ clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }}
                       >
                          <div className="relative z-10 flex flex-col items-center text-center gap-1">
                             <div className="flex items-center justify-center gap-1 w-full">
                                <div className="text-[var(--foreground)]/30 group-hover:text-[var(--foreground)] transition-all" style={{ color: fact.color }}>{fact.icon}</div>
                                <p className="text-[7px] font-black text-[var(--c-text-secondary)] uppercase tracking-[0.1em]">{fact.label}</p>
                             </div>
                             <p className="text-sm font-black text-[var(--foreground)] italic leading-none">{fact.value}</p>
                             <p className="text-[6px] font-black italic opacity-40 uppercase tracking-tighter" style={{ color: fact.color }}>Intensity: {fact.level}</p>
                             {/* Ultra-Compact Gauge */}
                             <div className="h-[2px] w-3/4 bg-[var(--foreground)]/5 rounded-full overflow-hidden mt-0.5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: fact.level }}
                                  transition={{ duration: 1, delay: 0.3 }}
                                  className="h-full" 
                                  style={{ backgroundColor: fact.color }} 
                                />
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>

              {/* Compact Digital Lab Badge */}
              <motion.div 
                whileHover={{ x: 5 }}
                className="relative p-3 bg-gradient-to-r from-success/20 to-transparent border-l-2 border-success/50 group"
                style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }}
              >
                 <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success border border-success/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                          <p className="text-[8px] font-black text-success uppercase tracking-widest">Quality Verified</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                       </div>
                       <p className="text-[9px] text-[var(--foreground)]/60 italic leading-tight truncate">
                          Registry #SPL-998 • <span className="text-success font-bold">100% Clean Harvest</span>
                       </p>
                    </div>
                 </div>
                 {/* Shimmer Line */}
                 <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[45deg] group-hover:left-[150%] transition-all duration-700" />
              </motion.div>

              {/* Cold-Chain Telemetry Guard */}
              <div className="p-3 bg-[var(--c-bg-alt)]/60 border border-[var(--foreground)]/5 rounded-[16px] space-y-2">
                 <p className="text-[8px] font-black uppercase text-[var(--c-primary)] tracking-widest">❄️ Temperature Tracking</p>
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-[var(--foreground)]">Stable -18.2°C</p>
                       <p className="text-[7px] font-bold uppercase text-[var(--c-text-secondary)]">Continuous Cold-Chain Active</p>
                    </div>
                    <div className="flex gap-1">
                       {[-18.0, -18.2, -18.1, -18.2].map((t, idx) => (
                         <span key={idx} className="bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/20 rounded text-[7px] font-black text-blue-500">{t}°C</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Column 2: Culinary Intelligence */}
           <div className="lg:col-span-4 space-y-[4px]">
              <h4 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-[4px]"><UtensilsCrossed className="w-4 h-4 text-[var(--c-primary)]" /> Cooking Tips & Recipes</h4>
              <div className="space-y-[4px]">
                 {product.recipes?.map((recipe: any, i: number) => (
                    <div key={i} className="p-4 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 flex items-center justify-between group hover:bg-[var(--c-primary)]/10 transition-all cursor-pointer">
                       <div className="space-y-[2px]">
                          <p className="text-xs font-black text-[var(--foreground)] uppercase italic group-hover:text-[var(--c-primary)]">{recipe.title}</p>
                          <div className="flex items-center gap-3 text-[8px] font-bold text-[var(--c-text-secondary)] uppercase tracking-widest">
                             <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {recipe.time}</span>
                             <span>{recipe.difficulty}</span>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-[var(--c-text-secondary)] group-hover:text-[var(--c-primary)]" />
                    </div>
                 ))}
                 <div className="p-4 rounded-[16px] border border-dashed border-[var(--foreground)]/10 flex flex-col items-center justify-center gap-2 opacity-40">
                    <MessageCircle className="w-4 h-4" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Request New Protocol</p>
                 </div>
              </div>
           </div>

           {/* Column 3: Authority & Trust Intelligence */}
           <div className="lg:col-span-4 space-y-[10px]">
              <div className="space-y-[4px]">
                 <h4 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-[4px]"><ShieldCheck className="w-4 h-4 text-success" /> Seller Information</h4>
                 <Card className="p-4 bg-[var(--c-bg-alt)]/40 border-[var(--foreground)]/5 rounded-[20px] space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 flex items-center justify-center text-xl rotate-12">⚓</div>
                       <div>
                          <h4 className="text-sm font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-1">{product.seller} <Verified className="w-3 h-3 text-blue-500" /></h4>
                          <p className="text-[8px] font-black text-success uppercase tracking-widest italic">Fleet Certified Agent</p>
                       </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-[var(--foreground)]/5">
                       <div className="flex items-center justify-between text-[9px] font-black uppercase text-[var(--c-text-secondary)]">
                          <span>Seller ID</span>
                          <span className="text-[var(--foreground)]">REG-{product.sellerId}</span>
                       </div>
                       <div className="flex items-center justify-between text-[9px] font-black uppercase text-[var(--c-text-secondary)]">
                          <span>Location</span>
                          <span className="text-[var(--foreground)]">Atlantic S4</span>
                       </div>
                    </div>

                    {/* Live Vessel & Traceability Registry */}
                    <div className="pt-3 border-t border-[var(--foreground)]/5 space-y-2">
                       <p className="text-[8px] font-black uppercase text-[var(--c-primary)] tracking-widest">🚢 Sourcing Details</p>
                       <div className="space-y-1 text-[8px] font-black uppercase text-[var(--c-text-secondary)]">
                          <div className="flex justify-between">
                             <span>Vessel ID</span>
                             <span className="text-[var(--foreground)]">M.V. Samudra-III</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Gear Used</span>
                             <span className="text-[var(--foreground)]">Handline / Line-Caught</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Captain</span>
                             <span className="text-[var(--foreground)]">Capt. Anand Shekhar</span>
                          </div>
                       </div>
                    </div>

                    <Button className="w-full h-10 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 text-[9px] font-black uppercase text-[var(--foreground)] hover:bg-[var(--foreground)]/10 flex items-center justify-center gap-2 mt-2"><MessageCircle className="w-3 h-3" /> DISPATCH CHAT</Button>
                 </Card>
              </div>
              <div className="flex flex-wrap gap-[4px]">
                 {product.trustBadges?.map((badge: string) => (
                    <Badge key={badge} className="px-3 py-1.5 rounded-lg bg-[var(--foreground)]/5 border-[var(--foreground)]/10 text-[var(--foreground)] text-[8px] font-black uppercase italic hover:bg-[var(--foreground)]/10 transition-all cursor-default">
                       {badge}
                    </Badge>
                 ))}
              </div>
           </div>
        </div>

        {/* --- LAYER 3: SOCIAL PROOF LAYER (REVIEWS) --- */}
        <section id="reviews-section" className="mt-[10px] pt-[10px] border-t border-[var(--foreground)]/5 space-y-[10px] scroll-mt-20">
           <div className="flex items-center justify-between px-2">
              <div>
                <h4 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2"><Star className="w-5 h-5 text-warning" /> Customer Reviews</h4>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)]">Ratings & Reviews</p>
                  <Link 
                    href={`/customer/products/${product.id}/reviews`}
                    className="text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] hover:underline flex items-center gap-1"
                  >
                    See All Reports <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <Button 
                onClick={() => router.push(`/customer/reviews/write?productId=${product.id}&productName=${encodeURIComponent(product.name)}&sellerId=${product.seller_id || product.sellerId || 'SEL-000'}`)}
                className="h-10 px-6 rounded-full bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] hover:bg-[var(--c-primary)] hover:text-[var(--foreground)] transition-all"
              >
                Submit Feedback
              </Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px]">
              {reviews.length > 0 ? reviews.map((review: any, i: number) => (
                <Card key={i} className="p-6 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[24px] space-y-3">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[var(--c-primary)]/10 flex items-center justify-center font-black text-[var(--c-primary)]">{review.user_name?.charAt(0) || "U"}</div>
                         <div>
                            <p className="text-xs font-black text-[var(--foreground)] uppercase">{review.user_name || "Citizen"}</p>
                            <p className="text-[8px] font-bold text-[var(--foreground)]/30 uppercase">{new Date(review.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex gap-0.5">
                         {[...Array(5)].map((_, idx) => (
                           <Star key={idx} className={cn("w-3 h-3", idx < review.rating ? "text-warning fill-warning" : "text-[var(--foreground)]/10")} />
                         ))}
                      </div>
                   </div>
                   <p className="text-xs text-[var(--c-text-secondary)] italic leading-relaxed">"{review.comment}"</p>
                </Card>
              )) : product.customerReviews?.map((review: any, i: number) => (
                <Card key={i} className="p-6 bg-[var(--foreground)]/5 border-[var(--foreground)]/5 rounded-[24px] space-y-3 opacity-60">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[var(--c-primary)]/10 flex items-center justify-center font-black text-[var(--c-primary)]">{review.name.charAt(0)}</div>
                         <div>
                            <p className="text-xs font-black text-[var(--foreground)] uppercase">{review.name}</p>
                            <p className="text-[8px] font-bold text-[var(--foreground)]/30 uppercase">{review.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-0.5">
                         {[...Array(5)].map((_, idx) => (
                           <Star key={idx} className={cn("w-3 h-3", idx < review.rating ? "text-warning fill-warning" : "text-[var(--foreground)]/10")} />
                         ))}
                      </div>
                   </div>
                   <p className="text-xs text-[var(--c-text-secondary)] italic leading-relaxed">"{review.comment}"</p>
                </Card>
              ))}
           </div>
        </section>

        {/* --- LAYER 4: DISCOVERY LAYER (RELATED) --- */}
        <section className="mt-[10px] pt-[10px] border-t border-[var(--foreground)]/5 space-y-[10px]">
           <h4 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[var(--c-primary)]" /> Similar Products</h4>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-[10px]">
              {MASTER_PRODUCT_REGISTRY.slice(0, 5).map((item) => (
                <div key={item.id} onClick={() => router.push(`/customer/products/${item.id}`)} className="group cursor-pointer">
                   <Card className="aspect-square bg-black border-[var(--foreground)]/5 rounded-[20px] overflow-hidden relative group-hover:border-[var(--c-primary)]/30 transition-all">
                      <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                        {item.images?.[0]?.startsWith('http') ? <img src={item.images[0]} className="w-full h-full object-contain" /> : item.image}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-[10px] left-[10px] right-[10px] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                         <p className="text-[10px] font-black text-[var(--foreground)] uppercase truncate">{item.name}</p>
                         <p className="text-[9px] font-black text-[var(--c-primary)] italic">₹{item.price.toLocaleString()}</p>
                      </div>
                   </Card>
                </div>
              ))}
           </div>
        </section>

      </div>

    </>
  );
}
