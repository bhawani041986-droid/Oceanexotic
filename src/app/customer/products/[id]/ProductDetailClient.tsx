"use client";

import React, { useState, useEffect } from "react";
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
  Timer,
  ThermometerSnowflake,
  Plus,
  Minus,
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

import MainLayout from "@/components/layouts/MainLayout";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { MASTER_PRODUCT_REGISTRY, MASTER_ADDONS_REGISTRY } from "@/constants/products";
import { reviewService } from "@/services/reviewService";
import { Schema, generateProductSchema } from "@/components/seo/Schema";
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
  const { addItem } = useCartStore();
  const { currencySymbol } = useSettingsStore();

  const [product, setProduct] = useState<any>(initialProduct || baseline);
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState<any>(product?.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedCuts, setSelectedCuts] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);

  const { scrollY } = useScroll();
  const subHeaderOpacity = useTransform(scrollY, [100, 200], [0, 1]);

  useEffect(() => {
    if (productId) {
      reviewService.getProductReviews(productId).then(setReviews).catch(console.error);
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.images?.[0] || product.image,
      quantity,
      sellerId: product.seller_id || product.sellerId || "SEL-000",
      metadata: selectedCuts // Store cut preferences in cart
    });
    toast(`${product.name} commissioned to cart.`, "success");
  };

  if (!product) {
    return (
        <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[var(--c-primary)] animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--c-primary)] italic">Establishing ID Handshake...</p>
        </div>
    );
  }

  const allImages = product.images?.length > 0 ? product.images : [product.image];
  const productAddons = product.addons?.map((id: string) => MASTER_ADDONS_REGISTRY.find(a => a.id === id)).filter(Boolean) || [];

  return (
    <MainLayout>
      {/* Dynamic Structured Data for Search Engines */}
      <Schema type="Product" data={generateProductSchema(product)} />
      
      {/* Sticky Sub-header */}
      <motion.div style={{ opacity: subHeaderOpacity }} className="fixed top-0 left-0 right-0 z-[80] bg-[var(--c-bg)]/80 backdrop-blur-2xl border-b border-[var(--foreground)]/5 h-16 hidden lg:flex items-center">
         <div className="container mx-auto px-10 flex items-center justify-between">
            <div className="flex items-center gap-[4px]">
               <div className="w-10 h-10 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center text-xl">{product.image}</div>
               <div>
                  <h3 className="text-sm font-black text-[var(--c-text-primary)] uppercase italic">{product.name}</h3>
                  <p className="text-[9px] font-bold text-[var(--c-primary)] uppercase tracking-widest">{activeVariant?.label}</p>
               </div>
            </div>
            <div className="flex items-center gap-[10px]">
               <p className="text-xl font-black text-[var(--c-text-primary)] italic">₹{activeVariant?.price?.toLocaleString()}</p>
               <Button onClick={handleAddToCart} className="h-10 px-8 rounded-full bg-[var(--c-primary)] text-[var(--foreground)] text-[10px] font-black uppercase shadow-[var(--c-shadow-glow)]">ADD TO CART</Button>
            </div>
         </div>
      </motion.div>

      <div className="container mx-auto px-4 md:px-10 pt-4 md:pt-16 pb-10">
        {/* --- LAYER 1: COMMAND LAYER (HERO) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[4px] md:gap-[10px]">
          
          {/* Visual Registry */}
          <div className={cn("lg:col-span-7 space-y-[10px]", product.id === "PRD-002" && "flex flex-row-reverse gap-[6px] space-y-0")}>
            <div className={cn(
              "relative aspect-square md:aspect-[4/3] lg:aspect-square bg-[var(--c-bg-alt)] rounded-[20px] overflow-hidden group border border-[var(--foreground)]/5",
              product.id === "PRD-002" ? "flex-1" : "w-full"
            )}>
               <AnimatePresence mode="wait">
                 <motion.div 
                    key={activeImage} 
                    initial={{ opacity: 0, scale: 1.1 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.6 }} 
                    className="w-full h-full flex items-center justify-center text-[10rem] md:text-[15rem] overflow-hidden cursor-crosshair"
                    onMouseMove={(e) => {
                      if (product.id === "PRD-002") {
                        const target = e.currentTarget;
                        const { left, top, width, height } = target.getBoundingClientRect();
                        const x = ((e.clientX - left) / width) * 100;
                        const y = ((e.clientY - top) / height) * 100;
                        const img = target.querySelector('img');
                        if (img) {
                          img.style.transformOrigin = `${x}% ${y}%`;
                        }
                      }
                    }}
                 >
                   {(allImages[activeImage]?.startsWith('http') || allImages[activeImage]?.startsWith('/')) ? (
                     <img 
                        src={allImages[activeImage]} 
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-300",
                          product.id === "PRD-002" && "group-hover:scale-[2]"
                        )} 
                        alt={product.name} 
                      />
                   ) : allImages[activeImage]}
                 </motion.div>
               </AnimatePresence>
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-[10px] left-[10px] pointer-events-none">
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

               <div className="absolute bottom-[4px] md:bottom-[10px] right-[4px] md:right-[10px] flex gap-[2px] md:gap-[4px] z-10">
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--foreground)]/10 backdrop-blur-md border border-[var(--foreground)]/10 flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--c-primary)] transition-all shadow-xl"><Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                  <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-danger transition-all shadow-xl"><Heart className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
               </div>
            </div>

            <div className={cn(
              "flex gap-[4px] no-scrollbar overflow-auto",
              product.id === "PRD-002" ? "flex-col w-[60px] lg:w-[75px] shrink-0 h-full" : "flex-row pb-1"
            )}>
              {allImages.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onMouseEnter={() => product.id === "PRD-002" && setActiveImage(i)}
                  onClick={() => setActiveImage(i)} 
                  className={cn(
                    "relative overflow-hidden flex-shrink-0 border-2 transition-all bg-[var(--c-bg-alt)] flex items-center justify-center rounded-[8px]",
                    product.id === "PRD-002" ? "w-full aspect-square" : "w-16 h-16 md:w-24 md:h-24 text-xl md:text-3xl",
                    activeImage === i ? "border-[var(--c-primary)] scale-105 shadow-[var(--c-shadow-glow)]" : "border-[var(--foreground)]/5 opacity-60 hover:opacity-100"
                  )}
                >
                  {(img?.startsWith('http') || img?.startsWith('/')) ? <img src={img} className="w-full h-full object-cover" /> : img}
                </button>
              ))}
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
                        <p className="text-[8px] font-black text-[var(--c-text-secondary)] uppercase tracking-widest">Settlement Price</p>
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

               {/* Live Catch Info */}
               {product.catch_date && (
                 <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Clock className="w-3 h-3 text-primary" />
                       <span className="text-[8px] font-black uppercase text-primary">Freshness: {new Date(product.freshness_timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Anchor className="w-3 h-3 text-primary" />
                       <span className="text-[8px] font-black uppercase text-primary">Node: {product.harbor_node}</span>
                    </div>
                 </div>
               )}

               <div className="space-y-[4px] w-full">
                  {initialCutOptions && initialCutOptions.length > 0 ? (
                    <CutOptionsSelector 
                      cutOptions={initialCutOptions} 
                      basePrice={product.price} 
                      onSelectionChange={(cuts, price) => {
                        setSelectedCuts(cuts);
                        setCurrentPrice(price);
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
                               setCurrentPrice(v.price);
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
                             <div className="flex gap-[4px] md:gap-[10px]">
                  <div className="flex items-center bg-[var(--foreground)]/5 rounded-lg md:rounded-xl border border-[var(--foreground)]/10 overflow-hidden h-10 md:h-12 w-20 md:w-24">
                     <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex-1 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--foreground)]"><Minus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                     <span className="w-6 md:w-8 text-center font-black text-[var(--c-primary)] text-xs md:text-sm">{quantity}</span>
                     <button onClick={() => setQuantity(q => q + 1)} className="flex-1 h-full flex items-center justify-center hover:bg-[var(--foreground)]/10 text-[var(--foreground)]"><Plus className="w-2.5 h-2.5 md:w-3 md:h-3" /></button>
                  </div>
                  <button onClick={handleAddToCart} className="whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:opacity-90 px-6 md:px-8 py-2 flex-1 h-10 md:h-12 rounded-lg md:rounded-xl bg-[var(--c-primary)] text-[var(--foreground)] text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-[var(--c-shadow-glow)] flex items-center justify-center gap-[4px]">
                     <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" /> ADD TO CART
                  </button>
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

            {/* Addons Selection (Layer 1.5) */}
            {productAddons.length > 0 && (
              <div className="mt-4 p-6 bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 rounded-[24px]">
                <h4 className="text-[10px] md:text-xs font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Plus className="w-3.5 h-3.5 text-[var(--c-primary)]" /> Complementary Add-ons
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {productAddons.map((addon: any) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--c-bg-alt)] border border-[var(--foreground)]/10 hover:border-[var(--c-primary)]/50 transition-all cursor-pointer group">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate">{addon.name}</p>
                        <p className="text-[8px] font-black text-[var(--c-primary)] italic">₹{addon.price}</p>
                      </div>
                      <Button 
                        onClick={() => {
                          handleAddToCart();
                        }}
                        className="h-7 px-3 text-[8px] font-black uppercase tracking-widest bg-[var(--foreground)]/10 text-[var(--foreground)] group-hover:bg-[var(--c-primary)] group-hover:text-[var(--foreground)] rounded-md transition-all shadow-none group-hover:shadow-[var(--c-shadow-glow)]"
                      >
                        ADD
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                       Scientific Intelligence
                    </h4>
                    <span className="text-[7px] font-black text-[var(--c-primary)] uppercase tracking-widest bg-[var(--c-primary)]/10 px-1.5 py-0.5 rounded-sm border border-[var(--c-primary)]/20">ALPHA-v1.1</span>
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
                          <p className="text-[8px] font-black text-success uppercase tracking-widest">Sovereign Lab Verified</p>
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
           </div>

           {/* Column 2: Culinary Intelligence */}
           <div className="lg:col-span-4 space-y-[4px]">
              <h4 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-[4px]"><UtensilsCrossed className="w-4 h-4 text-[var(--c-primary)]" /> Chef Recipes</h4>
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
                 <h4 className="text-lg font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-[4px]"><ShieldCheck className="w-4 h-4 text-success" /> Authority Registry</h4>
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
                          <span>Sovereign ID</span>
                          <span className="text-[var(--foreground)]">REG-{product.sellerId}</span>
                       </div>
                       <div className="flex items-center justify-between text-[9px] font-black uppercase text-[var(--c-text-secondary)]">
                          <span>Port Authority</span>
                          <span className="text-[var(--foreground)]">Atlantic S4</span>
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
                <h4 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2"><Star className="w-5 h-5 text-warning" /> Customer Intelligence</h4>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--c-text-secondary)]">Reputation Ledger</p>
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
           <h4 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tighter flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[var(--c-primary)]" /> Similar Fleet Assets</h4>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-[10px]">
              {MASTER_PRODUCT_REGISTRY.slice(0, 5).map((item) => (
                <div key={item.id} onClick={() => router.push(`/customer/products/${item.id}`)} className="group cursor-pointer">
                   <Card className="aspect-square bg-[var(--c-bg-alt)] border-[var(--foreground)]/5 rounded-[20px] overflow-hidden relative group-hover:border-[var(--c-primary)]/30 transition-all">
                      <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                        {item.images?.[0]?.startsWith('http') ? <img src={item.images[0]} className="w-full h-full object-cover" /> : item.image}
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

    </MainLayout>
  );
}
